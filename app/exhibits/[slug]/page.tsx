import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalStage } from "../../../components/museum/AnimalStage";
import { animalSlugs, findAnimal, museumCatalog } from "../../../lib/exhibits/catalog";
import styles from "./page.module.css";

export function generateStaticParams() { return animalSlugs.map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const animal = findAnimal((await params).slug);
  if (!animal) return {};
  return { title: `${animal.name.zh}展品 · DUN`, description: animal.introduction.zh };
}

export default async function ExhibitPage({ params }: { params: Promise<{ slug: string }> }) {
  const animal = findAnimal((await params).slug);
  if (!animal) notFound();
  const index = museumCatalog.findIndex(({ slug }) => slug === animal.slug);
  const previous = museumCatalog[(index - 1 + museumCatalog.length) % museumCatalog.length];
  const next = museumCatalog[(index + 1) % museumCatalog.length];
  const model = animal.manifest.assets.find(({ type }) => type === "model")!;
  return <main className={styles.page} id="content">
    <a className={styles.skipLink} href="#exhibit">跳到展品内容</a>
    <header className={styles.topbar}><Link className={styles.returnLink} href="/">← 返回博物馆</Link></header>
    <article className={styles.exhibit} id="exhibit">
      <header className={styles.hero}><p className={styles.eyebrow}>今日展品</p><h1 className={styles.title}>{animal.name.zh}</h1><p className={styles.scientificName} lang="en">{animal.scientificName}</p></header>
      <AnimalStage animal={animal} />
      <nav className={styles.animalNav} aria-label="展品导航">
        <Link href={`/exhibits/${previous.slug}`}>← 上一只：{previous.name.zh}</Link>
        <span aria-current="page">当前：{animal.name.zh}</span>
        <Link href={`/exhibits/${next.slug}`}>下一只：{next.name.zh} →</Link>
      </nav>
      <section className={styles.section} aria-labelledby="observe-heading">
        <h2 className={styles.heading} id="observe-heading">先一起观察</h2><p className={styles.lead}>{animal.introduction.zh}</p><p lang="en">{animal.introduction.en}</p>
        <ol className={styles.promptGrid}>{animal.prompts.map(({ id, prompt }) => <li className={styles.promptCard} data-observation-prompt key={id}><p>{prompt.zh}</p><p lang="en">{prompt.en}</p></li>)}</ol>
        <aside className={styles.adultNote}><p>{animal.adultNote.zh}</p><p lang="en">{animal.adultNote.en}</p></aside>
      </section>
      <section className={styles.section} aria-labelledby="facts-heading">
        <h2 className={styles.heading} id="facts-heading">慢慢打开事实卡片</h2>
        {animal.facts.map((fact, index) => <details className={styles.factCard} data-fact-id={fact.id} key={fact.id}><summary>看看第 {index + 1} 张事实卡片</summary><p>{fact.text.zh}</p><p lang="en">{fact.text.en}</p><p className={styles.factSources}>{fact.sourceIds.map((id, sourceIndex) => { const source = animal.sources.find((item) => item.id === id); return source ? <span key={id}>{sourceIndex ? " · " : null}<a data-source-link data-source-id={id} href={source.url} target="_blank" rel="noreferrer" lang="en">{source.publisher}</a></span> : null; })}</p></details>)}
      </section>
      <details className={styles.sourcePanel} data-source-credit><summary>来源与创作说明</summary>
        <ul className={styles.sourceList}>{animal.sources.map((source) => <li key={source.id}><cite lang="en">{source.title}</cite> · <span lang="en">{source.publisher}</span><br />定位：<span lang="en">{source.locator}</span><br />查阅日期：{source.accessedOn}<br />{source.supports}<br /><a data-source-link href={source.url} target="_blank" rel="noreferrer">查看机构原页</a></li>)}</ul>
        <p>模型：{model.creator} · <a href={model.source} target="_blank" rel="noreferrer">{model.title}（Sketchfab）</a> · CC BY 4.0。{model.modifications}</p>
        <p>署名：{model.attribution}。许可证：<a href={model.licenseUrl} target="_blank" rel="noreferrer">Creative Commons Attribution 4.0</a>。</p>
        <p>运行时模型 SHA-256：<code>{model.runtimeSha256}</code></p>
        <p>环境、poster 与缩略图：DUN 项目程序化创作 · CC BY-SA 4.0；不作为科学证据。</p>
        {animal.slug === "triceratops" ? <p>迁移前静态图像：DUN 项目（使用 OpenAI 图像生成工具创作） · CC BY-SA 4.0；保留于 <code>/media/triceratops/exhibit.webp</code> 作为降级参考。</p> : null}
      </details>
      <section className={styles.closing} data-closing-section aria-labelledby="closing-heading"><h2 className={styles.heading} id="closing-heading">今天先看到这里</h2><p>{animal.closingPrompt.zh}</p><p lang="en">{animal.closingPrompt.en}</p><Link className={styles.returnLink} href="/">← 返回博物馆</Link></section>
    </article>
  </main>;
}
