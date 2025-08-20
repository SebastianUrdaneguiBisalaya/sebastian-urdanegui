import { type APIRoute } from "astro";
import { getCommentsByBlogPost, postComment } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    return new Response("Hello, Web Projects");
}

export const POST: APIRoute = async ({ request }) => {
    return new Response("Hello, Web Projects");
}