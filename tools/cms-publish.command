#!/bin/bash
# ダブルクリックで、admin で編集した内容を GitHub に push して公開する。
# 対象は content/ と img/uploads/ の変更だけ（それ以外のファイルは含めない）。

cd "$(dirname "$0")/.." || exit 1

CHANGES=$(git status --porcelain -- content img/uploads)
if [ -z "$CHANGES" ]; then
  echo "公開する変更はありません。"
  read -r -p "Enter で閉じます"
  exit 0
fi

echo "== 次の変更を公開します =="
git status --short -- content img/uploads
echo ""
git --no-pager diff --stat -- content
echo ""
read -r -p "公開しますか？ [y/N] " ans
if [ "$ans" != "y" ] && [ "$ans" != "Y" ]; then
  echo "中止しました。"
  read -r -p "Enter で閉じます"
  exit 0
fi

read -r -p "変更の説明（空のままでも可）: " msg
[ -z "$msg" ] && msg="サイトの内容を更新"

git add -- content img/uploads &&
  git commit -m "$msg" &&
  git pull --rebase --autostash &&
  git push

if [ $? -eq 0 ]; then
  echo ""
  echo "公開しました。数分以内に本番サイトに反映されます。"
else
  echo ""
  echo "!! 途中で失敗しました。上のメッセージを確認してください。"
fi
read -r -p "Enter で閉じます"
