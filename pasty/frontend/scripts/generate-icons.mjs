/**
 * Gera ícones PNG do Pasty a partir dos SVGs.
 * Uso: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(__dirname, '..', 'public')

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

const manifestSizes = [48, 72, 96, 128, 144, 152, 192, 384, 512]

async function generate() {
  const svgPath = path.join(PUBLIC, 'icon-192.svg')
  const svgBuffer = fs.readFileSync(svgPath)

  for (const { name, size } of sizes) {
    const outPath = path.join(PUBLIC, name)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`✅ ${name} (${size}x${size})`)
  }

  const manifestDir = path.join(PUBLIC, 'icons')
  if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true })
  for (const size of manifestSizes) {
    const outPath = path.join(manifestDir, `icon-${size}x${size}.png`)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`✅ icons/icon-${size}x${size}.png (${size}x${size})`)
  }

  console.log('\n🎉 Todos os ícones PNG foram gerados em public/')
}

generate().catch((err) => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
