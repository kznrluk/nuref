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
        't_welcome_nuref': '๐ Welcome to NuRef! Images can be added by DnD or copy-paste.',
        't_image_added': '๐ Your first image has been added! Images will be saved in your browser. Don\'t forget to back them up.',
        't_workspace': '๐ You can also use the workspace if you have more images. Let\'s rewrite "main" in the upper left corner to create a new workspace.',
        't_workspace_url': '๐ก The workspace name matches the URL so you can bookmark it! That\'s all for the tutorial.',
        'warn_firefox_add_file': 'Firefox cannot drop from other websites or apps. Try copy-paste.',
        'warn_macos_add_file': 'macOS cannot drop from other websites or apps. Try copy-paste.',
        'warn_ios': 'This browser is not supported.',
      }
    },
    ja: {
      translation : {
        'n_last_image_deleted': '{{workSpaceID}} ใฎๆๅพใฎ็ปๅใๅ้คใใใพใใใใฏใผใฏในใใผในใฏ่ชๅ็ใซๅ้คใใใพใใ',
        'n_new_workspace': 'ๆฐใใใฏใผใฏในใใผใน {{workSpaceID}} ใไฝๆใใใพใใ',
        't_welcome_nuref': '๐ NuRefใธใใใใ๏ผใใฉใใฐใขใณใใใญใใใใใใใฏใณใใผใใผในใใง็ปๅใ่ฟฝๅ ใงใใพใใ',
        't_image_added': '๐ ๅใใฆใฎ็ปๅใ่ฟฝๅ ใใใพใใ๏ผ็ปๅใฏใใฉใฆใถๅใซไฟๅญใใใพใใใใใฏใขใใใฏๅฟใใใซ...ใ',
        't_workspace': '๐ ็ปๅใๅขใใฆใใใใฏใผใฏในใใผในใไฝฟใใพใใๅทฆไธใฎใmainใใๆธใๆใใฆๆฐใใใฏใผใฏในใใผในใไฝๆใใฆใฟใพใใใใ',
        't_workspace_url': '๐ก ใฏใผใฏในใใผในใฏURLใจไธ่ดใใฆใใใฎใงใใใใฏใใผใฏใใฆใOKใงใ๏ผใใฅใผใใชใขใซใฏไปฅไธใงใใ',
        'warn_firefox_add_file': 'Firefoxใฎๅ ดๅใฏไปใฎใฆใงใใตใคใใปใขใใชใใใใญใใใงใใพใใใใณใใผใใผในใใ่ฉฆใใฆใฟใฆใใ ใใใ',
        'warn_macos_add_file': 'macOSใฎๅ ดๅใฏไปใฎใฆใงใใตใคใใปใขใใชใใใใญใใใงใใพใใใใณใใผใใผในใใ่ฉฆใใฆใฟใฆใใ ใใใ',
        'warn_ios': 'ใใฎใใฉใฆใถใฏใตใใผใใใใฆใใพใใใๅไฝใซไธๅทๅใ็บ็ใใๅฏ่ฝๆงใใใใพใใ'
      }
    }
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
