import { createClient } from "@libsql/client";

const client = createClient({
    url: import.meta.env.TURSO_DATABASE_URL ?? "",
    authToken: import.meta.env.TURSO_AUTH_TOKEN ?? ""
});

export const getWebProjects = async () => {
    const response = await client.execute({
        sql: `SELECT * FROM web_projects`,
    });
    return response;
};

export const getDataProjects = async () => {
    const response = await client.execute({
        sql: `SELECT * FROM data_projects`,
    });
    return response;
};

export const getBlogPosts = async () => {
    const response = await client.execute({
        sql: `SELECT * FROM blog_posts`,
    });
    return response;
};

export const getBlogPost = async (id: string) => {
    const response = await client.execute({
        sql: `SELECT * FROM blog_posts WHERE id = ${id}`,
    });
    return response;
};

export const postView = async (id: string) => {
    const response = await client.execute({
        sql: `UPDATE web_projects SET views = views + 1 WHERE id = ${id}`,
    });
    return response;
};

export const postComment = async (id: string) => {
    const response = await client.execute({
        sql: `UPDATE web_projects SET comments = comments + 1 WHERE id = ${id}`,
    });
    return response;
};