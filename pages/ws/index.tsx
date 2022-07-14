import { NextPage } from 'next'
import Router from 'next/router'

const RedirectPage: NextPage = () => <>Redirect to main</>

RedirectPage.getInitialProps = async ({ res }) => {
    if (typeof window === 'undefined' && res?.writeHead) {
        res.writeHead(302, { Location: '/ws/main' })
        res.end()

        return {}
    }

    await Router.push('/ws/main')
}

export default RedirectPage