import { redirect, useLoaderData, useActionData, Form } from "@remix-run/react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { prisma } from "../../prisma/db.server";
import { ClerkApp, Protect, SignedIn, useUser } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { Resend } from 'resend';
import Navbar from "~/components/navbar";
import { clerkClient } from "@clerk/clerk-sdk-node";

type Message = {
  id: number;
  title: string;
  toUser: string;
  message: string;
  clerkUserId: string;
};

interface LoaderData {
  message: Message;
  fromUsername: string;
}

export const loader: LoaderFunction = async (args) => {
  const { params } = args;
  const { id } = params;
  const { userId } = await getAuth(args);

  const message = await prisma.message.findUnique({
    where: { id: parseInt(id!) },
  });

  if (!message) {
    throw new Response("Message not found", { status: 404 });
  }

  const clerkUser = await clerkClient.users.getUser(message.toUser);
  const fromUsername = clerkUser.username;
  return json({
    message, fromUsername
  });
};

export const action: ActionFunction = async (args) => {
  const { params, request } = args;
  const { userId } = await getAuth(args);
  const { id } = params;

  const message = await prisma.message.findUnique({
    where: { id: parseInt(id!) },
  });
};

export default function MessagePage() {
  const { message, fromUsername} = useLoaderData<LoaderData>();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">{message.title}</h1>
      <h2 className="text-2xl font-bold text-blue-600 mb-6">от {fromUsername}</h2>
      {message.message}
    </div>
  );
}
