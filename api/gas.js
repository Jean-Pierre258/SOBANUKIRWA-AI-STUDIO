
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed."
    });
  }

  // SOBANUKIRWA AI STUDIO Google Apps Script URL
  const endpoint =
    "https://script.google.com/macros/s/AKfycbyGzBWQ1wy0qzT3zuPYqx2Ijx1b_v2ou_ZV7rNsKHZ2H6meYhhd1ahMN_6Oq5gjD_aoyw/exec";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body || {}),
      redirect: "follow"
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error.message
    });
  }
}
