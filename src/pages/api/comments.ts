import { type APIRoute } from "astro";
import { getCommentsByBlogPost, postComment } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();
        const response = await getCommentsByBlogPost(id);
        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al obtener los datos: ${error}`, { status: 500 });
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id, user_name, comment } = await request.json();
        const response = await postComment(id, user_name, comment);
        return new Response(JSON.stringify(response), { status: 201 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al registrar los datos: ${error}`, { status: 500 });
    }
}