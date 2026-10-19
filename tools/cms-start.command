#!/bin/bash
# ダブルクリックで、ローカルの編集画面（admin）を開く。
#   1. GitHub から最新の内容を取り込む
#   2. ローカルサーバーを起動する
#   3. Chrome で http://localhost:8080/admin/ を開く
# 開いたら「ローカルレポジトリで作業」→ mypage フォルダを選択。
# 編集・保存が終わったら tools/cms-publish.command で公開する。
# 終了するときは、このウィンドウで Ctrl+C。

cd "$(dirname "$0")/.." || exit 1
PORT=8080

echo "== 最新の内容を取り込みます =="
if ! git pull --ff-only; then
  echo ""
  echo "!! 取り込みに失敗しました。ローカルとGitHubで内容が食い違っている可能性があります。"
  echo "   このまま編集はできますが、公開前に解消が必要です。"
fi

echo ""
echo "== ローカルサーバーを起動します（http://localhost:$PORT/）=="
python3 -m http.server "$PORT" --bind 127.0.0.1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT
sleep 1

# ローカル編集は Chrome / Edge のみ対応（Safari 不可）
URL="http://localhost:$PORT/admin/"
if [ -d "/Applications/Google Chrome.app" ]; then
  open -a "Google Chrome" "$URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  open -a "Microsoft Edge" "$URL"
else
  echo "!! Chrome か Edge で $URL を開いてください（Safari ではローカル編集ができません）"
fi

echo ""
echo "編集画面: $URL"
echo "サイト確認: http://localhost:$PORT/"
echo "終了するには Ctrl+C"
wait $SERVER_PID
