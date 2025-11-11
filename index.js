// pages/api/relay.js など
// ✅ GPT→Relay→GAS 中継サーバー（Vercelにデプロイ）

export default async function handler(req, res) {
  try {
    // GPTからの受信データ
    const { auth, spreadsheetId, post } = req.body;

    if (!auth || !spreadsheetId || !post) {
      throw new Error("auth, spreadsheetId, post が不足しています");
    }

    // GASのWebApp URL（1本のみ）
    const gasUrl = "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

    // GASに渡すデータ
    const payload = {
      mode: "post",
      auth,
      spreadsheetId,
      post,
    };

    // POST送信
    const gasResp = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await gasResp.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
