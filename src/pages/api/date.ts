export const prerender = false;

export async function GET({ }) {
    return new Response(JSON.stringify({
        date: new Date(),
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}