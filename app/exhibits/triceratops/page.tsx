import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "三角龙展品 · DUN",
  description: "一页正在共同准备的三角龙亲子观察展品。",
};

const prompts = [
  "先安静地看看这块空出来的位置。",
  "你希望以后在这里看见什么？",
  "和大人说说你现在注意到的形状。",
];

const factPlaceholders = ["事实卡片一", "事实卡片二", "事实卡片三"];

export default function TriceratopsPage() {
  return (
    <main id="content">
      <a href="#exhibit">跳到展品内容</a>
      <header>
        <Link href="/">← 返回博物馆</Link>
      </header>

      <article id="exhibit">
        <header>
          <p>今日展品正在准备中</p>
          <h1>三角龙展品</h1>
        </header>

        <figure data-exhibit-figure>
          <div role="img" aria-label="正在审阅中的三角龙复原图占位">展品图像正在审阅</div>
          <figcaption>复原图尚未完成，审核通过前不会展示。</figcaption>
        </figure>

        <section aria-labelledby="observe-heading">
          <h2 id="observe-heading">先一起观察</h2>
          <p>事实和图像都还在认真核对。现在可以先从三个小问题开始。</p>
          <ol>
            {prompts.map((prompt) => (
              <li data-observation-prompt key={prompt}>
                <p>{prompt}</p>
              </li>
            ))}
          </ol>
          <aside>
            <p>不用立刻告诉孩子答案。先听听孩子怎么说。</p>
          </aside>
        </section>

        <section aria-labelledby="facts-heading">
          <h2 id="facts-heading">事实卡片正在核对</h2>
          {factPlaceholders.map((title) => (
            <details data-fact-placeholder key={title}>
              <summary>{title}（审核中）</summary>
              <p>这条事实仍在核对可靠来源，暂不展示内容。</p>
            </details>
          ))}
        </section>

        <details data-source-credit>
          <summary>来源与创作说明（审核中）</summary>
          <p>可靠来源、图像作者和许可信息确认后会完整列在这里。</p>
        </details>

        <section data-closing-section aria-labelledby="closing-heading">
          <h2 id="closing-heading">今天先看到这里</h2>
          <p>离开屏幕后，和大人说说你最期待在展品里看到什么。</p>
          <Link href="/">← 返回博物馆</Link>
        </section>
      </article>
    </main>
  );
}
