const userGasUrl = "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

export default async function handler(req, res) {
  try {
    const getTokenResp = await fetch(`${userGasUrl}?mode=token`);
    const tokenData = await getTokenResp.json();

    if (!tokenData.ok || !tokenData.token || !tokenData.userId) {
      throw new Error("トークンまたは userId の取得に失敗しました");
    }

    const token = tokenData.token;
    const spreadsheetId = tokenData.userId;

    const posts = Array.isArray(req.body.post) ? req.body.post : [req.body.post];
    const results = [];

    for (const singlePost of posts) {
      const payload = {
        ...req.body,
        post: singlePost,
        auth: token,
        spreadsheetId
      };

      const gasResp = await fetch(userGasUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(payload)
      });

      const contentType = gasResp.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const raw = await gasResp.text();
        results.push({
          ok: false,
          error: "GASからJSON以外のレスポンス",
          preview: raw.slice(0, 300)
        });
        continue;
      }

      const gasResult = await gasResp.json();
      results.push(gasResult);
    }

    res.status(200).json({
      ok: true,
      count: results.length,
      results
    });

  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || "不明なエラー"
    });
  }
}
