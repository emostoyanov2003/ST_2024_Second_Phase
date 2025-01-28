import React, { useState } from "react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node"; // For handling the action
import { prisma } from "../../prisma/db.server"; // Adjust the path to your Prisma setup
import { Form, useActionData, useLoaderData } from "@remix-run/react"; // Correct import for useLoaderData
import { getAuth } from "@clerk/remix/ssr.server"; // Adjust based on your Clerk setup
import { Link } from "@remix-run/react";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface ActionData {
  error: string;
  success: string; // Added success message for successful item creation
}

interface Message {
  id: number;
  title: string;
  toUser: string;
  message: string;
  clerkUserId: string;
}

interface LoaderData {
    messages: Message[]; // Define the type of `messages`
}
// Loader function to fetch users from the database
export const loader = async (args: ActionFunctionArgs) => {
    const { userId: clerkUserId } = await getAuth(args);
    // If user is not authenticated, redirect or return an error response
    if (!clerkUserId) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const messages = await prisma.message.findMany({
        where: {
          toUser: clerkUserId,
        },
    }); // Fetch users from your database
    return json({ messages });
};

// Define the Action Function
export const action = async (args: ActionFunctionArgs) => {
  const { userId: clerkUserId } = await getAuth(args);
  if (!clerkUserId) {
    return redirect("/sign-up");
  }
};

const CreateItem: React.FC = () => {
  const actionData = useActionData<ActionData>(); // Handle action state (error/success)
  const { messages } = useLoaderData<LoaderData>(); // Use the type for loader data here

  console.log(messages); // Debugging line to inspect the fetched users

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Messages</h1>
        {/* Map over the messages to create list of elements */}
        {messages?.map((message) => (
            <Link
            to={`/messagePage/${message.id}`}
            className="px-4 py-2 rounded hover:bg-blue-500 transition"
            >
            {message.title}<br></br><br></br>
            </Link>
        ))}
    </div>
  );
};

export default CreateItem;
