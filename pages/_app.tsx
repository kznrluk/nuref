import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {initReactI18next} from "react-i18next";
import i18next from "i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation : {
        'n_last_image_deleted': 'The last image of {{workSpaceID}} has been deleted. Your workspace will be deleted automatically.',
        'n_new_workspace': 'A new workspace {{workSpaceID}} has been created',
        't_welcome_nuref': '👋 Welcome to NuRef! Images can be added by DnD or copy-paste.',
        't_image_added': '🎉 Your first image has been added! Images will be saved in your browser. Don\'t forget to back them up.',
        't_workspace': '📝 You can also use the workspace if you have more images. Let\'s rewrite "main" in the upper left corner to create a new workspace.',
        't_workspace_url': '💡 The workspace name matches the URL so you can bookmark it! That\'s all for the tutorial.',
        'warn_firefox_add_file': 'Cannot drop in Firefox. Try copy-paste.'
      }
    },
    ja: {
      translation : {
        'n_last_image_deleted': '{{workSpaceID}} の最後の画像が削除されました。ワークスペースは自動的に削除されます。',
        'n_new_workspace': '新しいワークスペース {{workSpaceID}} が作成されました',
        't_welcome_nuref': '👋 NuRefへようこそ！ドラッグアンドドロップ、もしくはコピーペーストで画像を追加できます。',
        't_image_added': '🎉 初めての画像が追加されました！画像はブラウザ内に保存されます。バックアップは忘れずに...。',
        't_workspace': '📝 画像が増えてきたらワークスペースも使えます。左上の「main」を書き換えて新しいワークスペースを作成してみましょう。',
        't_workspace_url': '💡 ワークスペースはURLと一致しているので、ブックマークしてもOKです！チュートリアルは以上です。',
        'warn_firefox_add_file': 'Firefoxの場合はドロップできないかもしれません。コピーペーストを試してみてください。'
      }
    }
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
