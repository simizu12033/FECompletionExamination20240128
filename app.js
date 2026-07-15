const state={filter:"すべて",query:"",onlyUnlearned:false,done:new Set(JSON.parse(localStorage.getItem("tokurei-fe-20240128-done")||"[]"))};
const fields=["すべて",...new Set(QUESTIONS.map(x=>x.field))];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const box=(text,cls="")=>`<div class="v-box ${cls}">${esc(text)}</div>`;
const arrow=(label="")=>`<div class="v-arrow"><i>→</i>${label?`<small>${esc(label)}</small>`:""}</div>`;
const flow=(parts,labels=[])=>`<div class="v-flow">${parts.map((x,i)=>`${i?arrow(labels[i-1]||""):""}${box(x,i===parts.length-1?"focus":"")}`).join("")}</div>`;
const stack=(layers)=>`<div class="v-stack">${layers.map((x,i)=>`<div style="--i:${i}">${esc(x)}</div>`).join("")}</div>`;
const cycle=(items)=>`<div class="v-cycle">${items.map((x,i)=>`<div><b>${i+1}</b><span>${esc(x)}</span></div>`).join("")}</div>`;
const formula=(top,bottom,steps=[])=>`<div class="v-formula rich-formula"><strong>${esc(top)}</strong>${steps.map(s=>`<em>${esc(s)}</em>`).join("")}<span>${esc(bottom)}</span></div>`;
const compare=(leftTitle,left,rightTitle,right)=>`<div class="v-compare"><section><h4>${esc(leftTitle)}</h4>${left.map(x=>`<p>${esc(x)}</p>`).join("")}</section><b>VS</b><section class="good"><h4>${esc(rightTitle)}</h4>${right.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>`;
const matrix=(headers,rows)=>`<div class="mini-table"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const cards=(items)=>`<div class="v-cardset">${items.map((x,i)=>`<section class="${i===items.length-1?"focus":""}"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></section>`).join("")}</div>`;
const layer=(items,focus)=>`<div class="v-layers">${items.map(x=>`<div class="${x===focus?"focus":""}">${esc(x)}</div>`).join("")}</div>`;
const grid=(items)=>`<div class="v-grid">${items.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`;
const miniNote=(title,items)=>`<div class="v-note"><b>${esc(title)}</b>${items.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`;
const splitDiagram=(title,left,right)=>`<div class="v-split"><b>${esc(title)}</b><section>${left.map(x=>`<span>${esc(x)}</span>`).join("")}</section><section class="good">${right.map(x=>`<span>${esc(x)}</span>`).join("")}</section></div>`;
const termFor=q=>typeof TERMS!=="undefined"?TERMS.find(t=>t.q===q.n):null;
const shortText=(text,max=22)=>{
  const s=String(text||"").replace(/^[アイウエ]：/,"").replace(/\s+/g,"").trim();
  return s.length>max?`${s.slice(0,max)}…`:s;
};
const answerLabel=q=>shortText(q.answerText||q.title,18);
const coreLabel=q=>shortText(termFor(q)?.term||q.title,16);
const qScenes={
  1:()=>compare("大きい値から加算",["小さい値が丸められる","情報落ち"],"小さい値から加算",["小さい値同士を先に集める","誤差を抑える"]),
  2:()=>formula("戻さず2本引く","1本目で分母が減る → 組合せ確率",["全体","当たり","同時"]),
  3:()=>flow(["開始記号","生成規則を適用","終端記号だけの文字列"],["置換","完成"]),
  4:()=>matrix(["列","1の個数","判定"],[["列1","奇数/偶数を確認","垂直パリティ"],["偶数個誤り","変化しない場合あり","検出漏れ"]]),
  5:()=>stack(["先に入れた値","途中の値","最後に入れた値","最初に出る"]),
  6:()=>formula("文字コード合計 mod 表サイズ","余りがハッシュ値",["合計","割る","余り"]),
  7:()=>compare("HTML",["表示用タグ","決まった要素が中心"],"XML",["タグを定義できる","データ構造を表す"]),
  8:()=>formula("命令数 × CPI ÷ クロック周波数","単位をそろえて実行時間",["命令数","CPI","Hz"]),
  9:()=>splitDiagram("主記憶を複数バンクへ分散",["Bank 0","Bank 1","Bank 2"],["並行アクセス","待ち時間を隠す","高速化"]),
  10:()=>splitDiagram("RAID1 ミラーリング",["Disk A","同じデータ"],["Disk B","同じデータ","片方故障でも継続"]),
  11:()=>flow(["クライアント","要求","サーバ","処理結果を返す"],["HTTP等","応答","表示"]),
  12:()=>flow(["現状負荷を測る","将来負荷を予測","CPU/メモリ等を計画"],["分析","見積り"]),
  13:()=>compare("断片化",["空き領域がばらばら","大きな領域が取れない"],"コンパクション",["使用領域を寄せる","空き領域をまとめる"]),
  14:()=>flow(["アプリケーション","API呼出し","OS/サービス機能"],["関数・仕様","結果"]),
  15:()=>compare("単なる無料利用",["条件なしではない","著作権放棄でもない"],"GPL",["改変・再配布条件","ソース公開の考え方"]),
  16:()=>flow(["基準クロック","位相比較","発振器を制御","同期した周波数"],["比較","補正","出力"]),
  17:()=>cards([["入力前","候補・形式を示す"],["入力中","誤りに気付きやすい"],["入力後","原因別に直せる"]]),
  18:()=>layer(["外部スキーマ","概念スキーマ","内部スキーマ"],"概念スキーマ"),
  19:()=>matrix(["列","重複","NULL","役割"],[["主キー","不可","不可","行を一意識別"],["候補キー","不可","不可","主キー候補"]]),
  20:()=>flow(["管理者","GRANT","利用者に権限付与"],["許可","SELECT等"]),
  21:()=>flow(["SQL文","構文解析","最適化","実行計画"],["文法確認","経路選択","実行"]),
  22:()=>flow(["バックアップ時点","更新ログを適用","障害直前へ復旧"],["ロールフォワード","再現"]),
  23:()=>matrix(["名前","変換先","仕組み"],[["example.jp","IPアドレス","DNS"],["IPアドレス","MACアドレス","ARP"]]),
  24:()=>flow(["フレーム受信","MACアドレス表を見る","該当ポートへ転送"],["学習","L2転送"]),
  25:()=>flow(["IPアドレスを知っている","ARP要求","MACアドレスを得る"],["同一LAN","応答"]),
  26:()=>compare("SMTP",["メール送信","サーバ間配送"],"IMAP4",["メール受信・閲覧","サーバ上で管理"]),
  27:()=>splitDiagram("第三者中継防止",["外部の第三者","送信依頼"],["メールサーバ","認証なしは拒否","迷惑メール中継を防ぐ"]),
  28:()=>compare("共通鍵暗号",["同じ鍵で暗号化/復号","鍵配送が課題"],"公開鍵暗号",["公開鍵と秘密鍵","鍵ペアを使う"]),
  29:()=>flow(["XML文書","署名値を付与","改ざん検知・本人確認"],["ハッシュ","検証"]),
  30:()=>cards([["攻撃者","解析・改ざんを試みる"],["耐タンパ性","内部情報を守る"],["例","ICカード等"]]),
  31:()=>compare("フォールスポジティブ",["正常を異常と判定","誤検知"],"フォールスネガティブ",["異常を正常と判定","見逃し"]),
  32:()=>flow(["端末のMACアドレス","許可リストと照合","接続可否を判断"],["識別","制限"]),
  33:()=>flow(["利用者端末","SSHで暗号化通信","遠隔サーバ操作"],["認証","安全な操作"]),
  34:()=>matrix(["DFD要素","意味"],[["丸","プロセス"],["矢印","データフロー"],["二重線","データストア"],["四角","外部実体"]]),
  35:()=>flow(["親クラス","属性・操作を引き継ぐ","子クラスで差分追加"],["継承","拡張"]),
  36:()=>compare("共通結合",["共通領域を参照","影響が広い"],"データ結合",["必要データだけ渡す","独立性が高い"]),
  37:()=>compare("ドライバ",["下からテスト","上位の代役"],"スタブ",["上からテスト","下位の代役"]),
  38:()=>cards([["サービス化","機能を独立単位にする"],["疎結合","呼出し仕様で連携"],["再利用","組合せて業務を作る"]]),
  39:()=>flow(["プロダクトバックログ","優先順位を決める","開発チームへ価値を伝える"],["価値","順序"]),
  40:()=>compare("機能追加",["外部仕様が変わる"],"リファクタリング",["外部仕様は同じ","内部構造を改善"]),
  41:()=>matrix(["工程","人数","期間","見る点"],[["A","必要人数","日数","延べ工数"],["全体","重なり","ピーク","要員計画"]]),
  42:()=>splitDiagram("ガントチャート",["作業A: ■■■"],["作業B:   ■■■","作業C:      ■■","期間と進捗を見る"]),
  43:()=>flow(["業務時間を避ける","バックアップ実行","復旧に必要な世代を残す"],["時刻","保存"]),
  44:()=>compare("導入費だけ",["初期費用のみ","安く見える"],"TCO",["運用費・保守費も含む","総費用で比較"]),
  45:()=>compare("同一場所保管",["火災・災害で同時被害"],"遠隔/別場所保管",["同時被災を避ける","復旧可能性を高める"]),
  46:()=>cards([["定型作業","画面入力・転記"],["RPA", "手順を自動実行"],["不向き","判断・例外対応中心"]]),
  47:()=>flow(["蓄積データ","集計・分析","経営判断に使う"],["BI","意思決定"]),
  48:()=>compare("自社工場を持つ",["製造設備を保有"],"ファブレス",["企画・設計に集中","製造は外部委託"]),
  49:()=>flow(["優良他社を調べる","差を測る","自社改善へ反映"],["比較","改善"]),
  50:()=>flow(["対象人数","移行率を掛ける","購入見込みを出す"],["段階計算","予測"]),
  51:()=>matrix(["BSC視点","指標例"],[["顧客","満足度・継続率"],["内部プロセス","品質・納期"],["学習と成長","教育・スキル"]]),
  52:()=>compare("プロセス革新",["作り方を変える"],"プロダクト革新",["新しい製品・サービス","市場価値を作る"]),
  53:()=>compare("ユーザビリティ",["使いやすさ"],"アクセシビリティ",["誰でも利用可能","高齢者・障害者も含む"]),
  54:()=>cards([["表示装置","電子看板"],["配信", "時間・場所に応じて表示"],["用途","広告・案内・告知"]]),
  55:()=>flow(["ICタグ","電波で読み取り","個体識別・在庫管理"],["RFID","非接触"]),
  56:()=>compare("人員削減",["仕事を失う人が出る"],"ワークシェアリング",["労働時間を分け合う","雇用維持"]),
  57:()=>formula("利益 × 確率 を合計","期待値で案を比較",["ケース別利益","確率","合計"]),
  58:()=>splitDiagram("線形計画法",["制約条件","人員・時間・資源"],["目的関数","利益最大化","最適な組合せ"]),
  59:()=>formula("利益 = 売上 - 変動費 - 固定費","売上最大ではなく利益最大",["数量","単価/費用","比較"]),
  60:()=>compare("アイデア・アルゴリズム",["考え方そのもの","著作権の中心ではない"],"プログラム表現",["コードとして表現","著作権法で保護"])
};
function detailedFrame(q,visual){
  const term=termFor(q);
  const steps=(q.reasoning||[]).slice(0,3);
  const chips=Array.isArray(q.diagram)?q.diagram.slice(0,4):[];
  return `<div class="v-detail">
    <div class="v-detail-main">${visual}</div>
    <aside class="v-detail-side">
      <div class="v-detail-title">
        <span>見る順</span>
        <strong>${esc(term?.term||q.title)}</strong>
      </div>
      <ol>${steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      <div class="v-detail-cue">
        <b>覚える軸</b>
        <p>${esc(term?.cue||q.caption||q.title)}</p>
      </div>
      <div class="v-detail-trap">
        <b>注意</b>
        <p>${esc(q.trap)}</p>
      </div>
      ${chips.length?`<div class="v-detail-chips">${chips.map(x=>`<i>${esc(x)}</i>`).join("")}</div>`:""}
    </aside>
  </div>`;
}

function autoDiagram(q){
  if(qScenes[q.n])return qScenes[q.n](q);
  const core=coreLabel(q);
  const answer=answerLabel(q);
  if(q.field==="基礎理論"||q.field==="会計"){
    return formula(core,`問${q.n}の条件 → ${answer}`,["条件確認","式・定義","選択肢"]);
  }
  if(q.field==="データベース"){
    return flow(["DB内の役割",core,answer],["分類","照合"]);
  }
  if(q.field==="ネットワーク"){
    return flow(["送信元/宛先",core,answer],["対応付け","判断"]);
  }
  if(q.field==="開発技術"){
    return flow(["図・工程の目的",core,answer],["記法確認","判断"]);
  }
  if(q.field==="セキュリティ"){
    return cards([["保護対象",core],["目的",answer],["見分け方","暗号・認証・防止を分ける"]]);
  }
  if(q.field==="ストラテジ"||q.field==="マネジメント"){
    return cards([["場面",shortText(q.title,18)],["中心語",core],["正解軸",answer]]);
  }
  return flow(["問題条件",core,answer],["注目","選択"]);
}

function richVisual(q){
  return autoDiagram(q);
}
window.renderRichVisual=q=>detailedFrame(q,richVisual(q));
