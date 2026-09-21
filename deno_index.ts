async function handler(req: Request): Promise<Response> {
  const incomingUrl = new URL(req.url);
  if (incomingUrl.pathname === "/") {
    return new Response(
      "此地址只用于为astrbot提供更快速的github访问服务",
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  const targetUrlString = decodeURIComponent(incomingUrl.pathname.slice(1));

  if (!targetUrlString || (!targetUrlString.startsWith("http://") && !targetUrlString.startsWith("https://"))) {
    return new Response("Invalid or missing target URL in path. Usage: /<target_url>", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const response = await fetch(targetUrlString, {
      headers: req.headers,
      method: req.method,
      body: req.body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, *");

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response(`Failed to proxy request to ${targetUrlString}: ${error.message}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

console.log("此地址只用于帮助astrbot更快的连接github");
Deno.serve({ port: 8000, hostname: "0.0.0.0" }, handler);
