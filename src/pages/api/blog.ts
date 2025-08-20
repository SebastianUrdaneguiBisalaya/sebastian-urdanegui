import { type APIRoute } from "astro";
import { getBlogPost } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    return new Response("Hello, Web Projects");
}