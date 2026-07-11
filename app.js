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
const termFor=q=>typeof TERMS!=="undefined"?TERMS.find(t=>t.q===q.n):null;
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
  const parts=Array.isArray(q.diagram)&&q.diagram.length?q.diagram:[q.title,q.answerText];
  if(q.field==="基礎理論"||q.field==="会計")return formula(parts[0],parts.slice(1).join(" → "));
  if(q.field==="データベース"||q.field==="ネットワーク"||q.field==="開発技術")return flow(parts);
  if(q.field==="セキュリティ"||q.field==="ストラテジ"||q.field==="マネジメント")return cards(parts.map((x,i)=>[i+1,x]));
  return flow(parts);
}

function richVisual(q){
  switch(q.n){
    case 1:return compare("符号なしで読む",["左端も値の一部","0以上の整数だけ"],"補数で読む",["左端は符号の手掛かり","負数は反転+1で大きさを見る"]);
    case 2:return formula("確率 = 条件に合う場合 ÷ 全場合","分母と分子を先に固定する",["同様に確からしいか確認","余事象なら 1−P"]);
    case 3:return cards([["AND","両方1なら1"],["OR","どちらか1なら1"],["XOR","異なれば1"],["シフト","桁位置を動かす"]]);
    case 4:return compare("実数を無限桁で扱う",["理論上は誤差なし"],"コンピュータで扱う",["桁数が有限","丸め・打切りが入る"]);
    case 5:return stack(["1 pushで積む","2 popは一番上だけ","3 下の要素は上を出してから","4 実現できる順序を追う"]);
    case 6:return matrix(["見る場所","確認すること","使い方"],[["左列","入力・添字","探す値を決める"],["中央","対応表","行を一致させる"],["右列","出力・符号","選択肢と照合"]]);
    case 7:return flow(["初期値を書く","条件を判定","処理で値を更新","次の条件へ戻る","終了時の値を読む"]);
    case 8:return formula("CPU時間 = 命令数 × CPI ÷ クロック周波数","平均CPIは出現率で重み付け",["MHz/GHzの単位","1命令あたりクロック数"]);
    case 9:return formula("平均アクセス時間","ヒット時 + ミス時ペナルティ × ミス率",["キャッシュあり","主記憶アクセス","ヒット率を使う"]);
    case 10:return flow(["CPUが指示","制御装置が仲介","装置がデータ転送","完了をCPUへ通知"]);
    case 11:return compare("クライアント",["要求する","画面操作・入力"],"サーバ",["サービスを提供","データ・処理を集中管理"]);
    case 12:return compare("冗長化なし",["1台故障で停止"],"冗長化あり",["予備系へ切替","縮退しても継続"]);
    case 13:return compare("スループット",["一定時間の処理量","件/秒"],"レスポンスタイム",["要求から応答までの時間","秒"]);
    case 14:return flow(["ソースプログラム","字句・構文解析","目的プログラム生成","実行可能にする"]);
    case 15:return compare("OSSで認められること",["利用","改変","再配布"],"ただし",["著作権は残る","ライセンス条件に従う"]);
    case 16:return matrix(["入力A","入力B","AND","OR","XOR"],[["0","0","0","0","0"],["0","1","0","1","1"],["1","0","0","1","1"],["1","1","1","1","0"]]);
    case 17:return cards([["モデリング","形を作る"],["シェーディング","陰影を付ける"],["マッピング","表面に画像を貼る"],["レンダリング","画像として出す"]]);
    case 18:return flow(["データを一元管理","重複を減らす","同時利用を制御","一貫性を守る"]);
    case 19:return compare("正規化前",["同じ情報が繰返し出る","更新漏れが起きやすい"],"正規化後",["決定関係ごとに表を分ける","重複を抑える"]);
    case 20:return flow(["SELECT: 何を出すか","FROM: どの表か","WHERE: どの行か","結果行を確認"]);
    case 21:return flow(["Javaプログラム","JDBCドライバ","DBMSへ接続","SQL実行・結果取得"]);
    case 22:return matrix(["後続＼先行","共有ロック","排他ロック"],[["共有ロック","○ 同時読取り可","× 待つ"],["排他ロック","× 待つ","× 待つ"]]);
    case 23:return formula("伝送時間 = データ量 ÷ 実効速度","byteなら ×8 して bit に直す",["回線速度","伝送効率","単位換算"]);
    case 24:return layer(["アプリケーション層","トランスポート層","インターネット層: IPで中継","リンク層","物理的な通信"],"インターネット層: IPで中継");
    case 25:return formula("ブロックサイズ = 256 − マスク値","IPが入る範囲の先頭がネットワークアドレス",["/28なら16刻み","範囲の末尾はブロードキャスト"]);
    case 26:return flow(["ブラウザが要求","Webサーバが受信","外部プログラムを起動","生成結果を返す"]);
    case 27:return cycle(["偵察","武器化","配送","攻撃実行","感染","遠隔操作","目的達成"]);
    case 28:return flow(["データをデータ鍵で暗号化","データ鍵を別の鍵で暗号化","鍵を包んで保管","必要時に鍵を復号"]);
    case 29:return compare("普段どおり",["同じ端末","同じ場所","同じ時間帯"],"リスク高",["未知端末","海外アクセス","追加認証"]);
    case 30:return flow(["経営方針","セキュリティ方針","管理策を実施","評価・改善を回す"]);
    case 31:return compare("IDS",["検知・通知が中心"],"IPS",["検知に加えて遮断","侵入防止まで行う"]);
    case 32:return compare("暗号化",["内容を読めなくする","存在は見える"],"ステガノグラフィ",["存在自体を隠す","画像等へ埋め込む"]);
    case 33:return flow(["SSIDを選ぶ","事前共有鍵を入力","APと端末で同じ鍵","暗号化通信"]);
    case 34:return flow(["開始ノード","アクション","分岐・合流","並行処理","終了ノード"]);
    case 35:return flow(["クラス: 属性・操作の定義","生成する","インスタンス: 実体","個別の値を持つ"]);
    case 36:return flow(["設計書を用意","複数人で確認","仕様漏れ・矛盾を発見","後工程の手戻りを減らす"]);
    case 37:return compare("静的解析",["実行前","ソースコードを読む"],"動的解析",["実行中","動作や性能を見る"]);
    case 38:return formula("期待費用 = 件数 × 発生率 × 影響割合 × 単価","条件にある対象だけを掛ける",["潜在件数","初年度発見率","影響度大"]);
    case 39:return compare("スクラムマスター",["スクラム理解を支援","障害除去","改善を促す"],"プロダクトオーナー",["価値最大化","優先順位を決める"]);
    case 40:return compare("リファクタリング前",["動くが読みにくい","変更しにくい"],"リファクタリング後",["外部動作は同じ","内部構造を改善"]);
    case 41:return matrix(["工程","計算","期間"],[["基本設計","人月÷人数","2か月"],["詳細設計","人月÷人数","2か月"],["製造・単体","人月÷人数","2か月"],["結合","人月÷人数","6か月"],["総合","人月÷人数","2か月"]]);
    case 42:return cards([["PV","計画した出来高"],["EV","実際の出来高"],["AC","実コスト"],["CPI/SPI","費用・予定の効率"]]);
    case 43:return compare("コールドスタート",["初期状態から再起動","状態を引き継がない"],"ログ回復",["ロールバック","ロールフォワード"]);
    case 44:return flow(["雷サージが侵入","SPDが大地へ逃がす","過電圧を抑える","機器を保護"]);
    case 45:return flow(["監査目的を決める","管理基準を尺度にする","証拠を集める","評価・報告する"]);
    case 46:return compare("As-Isモデル",["現在の業務・システム"],"To-Beモデル",["将来のあるべき姿","移行計画の目標"]);
    case 47:return flow(["発電量を計測","消費量を計測","通信で集約","需給を制御"]);
    case 48:return flow(["利害関係者を識別","ニーズを聞く","制約条件を整理","要件として確定"]);
    case 49:return flow(["合併・買収","人材・技術・顧客を取得","既存事業と統合","相乗効果を狙う"]);
    case 50:return stack(["導入期: 認知を広げる","成長期: 売上急増・競争激化","成熟期: 差別化・効率化","衰退期: 撤退や縮小を検討"]);
    case 51:return grid(["財務: 売上・利益","顧客: 満足度・クレーム","内部プロセス: 品質・納期","学習と成長: 人材・知識"]);
    case 52:return `<div class="s-curve"><svg viewBox="0 0 320 160" aria-hidden="true"><path d="M25 130 C80 130 92 118 115 92 C145 55 185 35 295 30"/><path d="M180 132 C215 128 228 110 250 82 C270 55 292 42 310 38"/></svg><span>導入 → 成長 → 成熟 → 次の技術へ</span></div>`;
    case 53:return flow(["家庭内の家電・設備","使用電力を測る","見える化する","自動制御で最適化"]);
    case 54:return compare("順次開発",["設計後に生産準備","手戻りが遅い"],"コンカレント",["部門が早期から並行","期間短縮"]);
    case 55:return flow(["発注者が業務を公開","不特定多数へ募集","受注者が応募","成果物を納品"]);
    case 56:return matrix(["軸","代表例","ねらい"],[["職能軸","開発・営業・製造","専門性"],["事業軸","製品・地域・顧客","目的達成"],["重ねる","二重所属","両立"]]);
    case 57:return formula("定量発注 = 発注点で一定量Eを発注","予測在庫が増えたら超過分を取り消す",["安全在庫S","変更後在庫X","X−S"]);
    case 58:return compare("ヒストグラム",["階級ごとの度数","分布・ばらつきを見る"],"特性要因図など",["原因整理や管理限界を見る図とは別"]);
    case 59:return formula("利益 = (販売価格 − 変動費) × 数量 − 固定費","限界利益で固定費を回収する",["販売数を先に求める","最後に固定費を引く"]);
    case 60:return compare("雇用契約",["派遣元 ↔ 労働者"],"労働者派遣契約",["派遣元 ↔ 派遣先","指揮命令は派遣先"]);
    default:return autoDiagram(q);
  }
}
window.renderRichVisual=q=>detailedFrame(q,richVisual(q));
