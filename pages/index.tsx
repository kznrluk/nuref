import {NextPage} from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const Home: NextPage = () => {
    return <>
        <Head>
            <title>NuRef</title>
        </Head>
        <div>
            <header
                style={{
                    width: '100vw',
                    paddingTop: '25px',
                    paddingBottom: '25px',
                    backgroundColor: '#333333',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#FAFAFA'
                }}
            >
                <div>
                    <Image alt="nuref logo" src={"/nulogo.png"} width={128} height={128} style={{
                        backgroundColor: "#FAFAFA",
                    }}></Image>
                    <span style={{
                        fontSize: 'clamp(12px, 15vw, 256px)',
                    }}>NuRef</span>
                </div>

                <div style={{
                    textAlign: 'center',
                    fontSize: 'clamp(14px, 8vw, 32px)',
                }}>
                    開いて、並べて、始めよう
                </div>
            </header>

            <div style={{
                width: '100vw',
                color: '#edf5ff',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    maxWidth: '768px'
                }}>
                    <div style={{
                        width: '100%',
                        textAlign: 'center',
                        paddingBottom: '25px',
                        fontSize: '32px',
                    }}>
                        <Link href="/ws/">🖼️今すぐ試してみる！</Link>
                    </div>

                    <div>
                        NuRefは、ブラウザで使える参考資料ビューアです。

                        <section　style={{paddingBottom: '18px'}}>
                            <h2>👩‍💻ブラウザでアクセスするだけですぐに使える</h2>
                            <p>面倒なインストールや設定は必要ありません。ブラウザでワークスペースにアクセスするだけですぐにイラストを貼り付けて作業を開始することができます。</p>
                            <p>ブラウザを閉じても画像や配置はそのまま記憶されます。</p>
                        </section>

                        <section　style={{paddingBottom: '18px'}}>
                            <h2>🐁ドラッグアンドドロップで画像を簡単追加</h2>
                            <p>PC内の画像に加え、一部Webページ等からドラッグアンドドロップで画像を追加することができます。</p>
                            <p>※一部ブラウザでは動作しない可能性があります。</p>
                        </section>

                        <section　style={{paddingBottom: '18px'}}>
                            <h2>🗂️大量の画像も整理しやすく</h2>
                            <p>無限に作れるワークスペース機能で大量の画像も分類して管理できます。NuRefを複数のウィンドウで開けば、複数のワークスペースを同時に見ることだってできちゃいます。</p>
                            <p>画像が1枚もなくなったワークスペースは自動できちんと削除されます。</p>
                        </section>

                        <section　style={{paddingBottom: '18px'}}>
                            <h2>🎶簡単・直感的な操作</h2>
                            <p>複雑なショートカットを覚える必要はもうありません。</p>
                            <p>NuRefは簡単かつシンプルであることに重きをおいています。回転、反転、トリミングといった基本的な機能はすべてマウスで操作することができます。</p>
                        </section>

                        <section　style={{paddingBottom: '18px'}}>
                            <h2>💕アップロードなし アカウントなし 安全安心</h2>
                            <p>ブラウザに貼り付けられた画像は、すべてお使いのブラウザの中だけに保存されます。画像がインターネット上にアップロードされることはありません。</p>
                            <p>ページを構成するソースコードはすべて公開されており、誰でも見ることができます。</p>
                        </section>

                        <section style={{paddingBottom: '18px'}}>
                            <h2>🛠️まだまだ開発中</h2>
                            <p>NuRefはまだまだ開発中のソフトウェアです。もしかしたらあなたの希望している機能がなかったり、エラーが出たりするかもしれません。</p>
                            <p>そんな時はぜひご意見をください。下のリンクからTwitterとGitHubに飛ぶことができます。</p>
                        </section>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <p>
                            <a href="https://github.com/kznrluk/nuref">GitHub: https://github.com/kznrluk/nuref</a>
                        </p>
                        <p>
                            <a href="https://twitter.com/kznrluk">Twitter: https://twitter.com/kznrluk</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default Home
