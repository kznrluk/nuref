/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: false,
})
module.exports = withBundleAnalyzer({...nextConfig})
