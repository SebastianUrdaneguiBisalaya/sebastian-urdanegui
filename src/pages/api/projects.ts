import { type APIRoute } from "astro";
import { getListContent, postView } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    return new Response("Hello, Data Projects");
}

export const PATCH: APIRoute = async ({ request }) => {
    return new Response("Hello, Data Projects");
}