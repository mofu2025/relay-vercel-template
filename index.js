export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const userGasUrl = "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec"; // ★ここを書き換える

  try {
    const relayResponse = await fetch(userGasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const result = await relayResponse.json();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Relay failed", detail: err.message });
  }
}
