const userGasUrl = "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

export default async function handler(req, res) {
  try {
    // ステップ①：トークン取得（未設定なら自動発行）
    const getTokenResp = await fetch(`${userGasUrl}?mode=token`);
    const tokenData = await getTokenResp.json();

    if (!tokenData.ok || !tokenData.token) {
      throw new Error("トークン取得に失敗しました");
    }

    const token = tokenData.token;

    // ステップ②：元の投稿データに auth を追加
    const payload = {
      ...req.body,
      auth: token
    };

    // ステップ③：ユーザーGASにPOST
    const gasResp = await fetch(userGasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const gasResult = await gasResp.json();
    res.status(200).json(gasResult);

  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
