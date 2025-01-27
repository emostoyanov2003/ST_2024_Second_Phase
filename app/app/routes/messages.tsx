import React, { useState } from "react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node"; // For handling the action
import { prisma } from "../../prisma/db.server"; // Adjust the path to your Prisma setup
import { Form, useActionData, useLoaderData } from "@remix-run/react"; // Correct import for useLoaderData
import { getAuth } from "@clerk/remix/ssr.server"; // Adjust based on your Clerk setup

interface ActionData {
  error: string;
  success: string; // Added success message for successful item creation
}

interface User {
  id: number;
  name: string;
}

interface LoaderData {
  users: User[]; // Define the type of `users`
}
// Loader function to fetch users from the database
export const loader = async () => {
  const users = await prisma.user.findMany(); // Fetch users from your database
  return json({ users });
};

// Define the Action Function
export const action = async (args: ActionFunctionArgs) => {
  const { userId: clerkUserId } = await getAuth(args);
  if (!clerkUserId) {
    return redirect("/sign-up");
  }

  const formData = await args.request.formData();
  const messageTitle = formData.get("title") as string;
  const message = formData.get("message") as string;
  const toUser = formData.get("toUser") as string;

  // Validate the required fields
  if (!messageTitle || !toUser || !message || !clerkUserId) {
    return json({ error: "All fields are required!" }, { status: 400 });
  }
  

  // Save the data into the database
  try {
    await prisma.message.create({
      data: {
        title: messageTitle,
        message: message,
        toUser: parseInt(toUser),
        clerkUserId: clerkUserId,
      },
    });
    return redirect("/"); // Redirect after successful creation
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to create item" }, { status: 500 });
  }
};

const CreateItem: React.FC = () => {
  const actionData = useActionData<ActionData>(); // Handle action state (error/success)
  const { users } = useLoaderData<LoaderData>(); // Use the type for loader data here

  console.log(users); // Debugging line to inspect the fetched users

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Send message</h1>

      <Form method="post" encType="multipart/form-data" className="space-y-6">
        {actionData?.error && (
          <p className="text-red-500 text-sm">{actionData.error}</p>
        )}
        {actionData?.success && (
          <p className="text-green-500 text-sm">{actionData.success}</p>
        )}

        {/* User Selection */}
        <div>
          <label htmlFor="toUser" className="block font-medium text-gray-700">
            Choose user
          </label>
          <select
            id="toUser"
            name="toUser"
            required
            className="w-full border-b-2 border-blue-600 p-2 outline-none focus:border-gray-300"
          >
            <option value="">Select User</option>
            {/* Map over the users to create option elements */}
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full border-b-2 border-blue-600 p-2 outline-none focus:border-gray-300"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={10}
            required
            className="w-full border-b-2 border-blue-600 p-2 outline-none focus:border-gray-300"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
        >
          Submit
        </button>
      </Form>
    </div>
  );
};

export default CreateItem;
