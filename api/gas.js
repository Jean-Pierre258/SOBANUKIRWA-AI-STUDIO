
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok:false,
      error:"Method not allowed."
    });
  }

  const endpoint = process.env.GAS_WEB_APP_URL;

  if (!endpoint) {
    return res.status(500).json({
      ok:false,
      error:"GAS_WEB_APP_URL is not configured."
    });
  }

  try {
    const response = await fetch(endpoint, {
      method:"POST",
      headers:{
        "Content-Type":"text/plain;charset=utf-8"
      },
      body:JSON.stringify(req.body || {}),
      redirect:"follow"
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch(error) {
    return res.status(502).json({
      ok:false,
      error:error.message
    });
  }
}
