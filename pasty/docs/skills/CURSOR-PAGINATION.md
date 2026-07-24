# 📄 Skill: Paginação por Cursor (Keyset Pagination)

> Padrão de paginação escalável aprendido no Pasty — substitui OFFSET para performance O(log n).

---

## O Problema do OFFSET

```sql
-- ❌ Ruim: O(n) — PostgreSQL precisa escanear todas as linhas anteriores
SELECT * FROM clips WHERE user_id = 1
ORDER BY created_at DESC
OFFSET 100000 LIMIT 20
```

Com 10 milhões de registros, OFFSET 100.000 significa escanear 100.020 linhas.

## A Solução: Cursor

```sql
-- ✅ Bom: O(log n) — usa índice da PK para pular direto
SELECT * FROM clips WHERE user_id = 1 AND id < 100000
ORDER BY created_at DESC, id DESC
LIMIT 20
```

O banco usa o índice da PK para encontrar `id = 100000` em O(log n) e escaneia apenas 20 linhas.

## Implementação no Pasty

### Query Builder Dinâmico
```typescript
const conditions: string[] = ['user_id = $1']
const params: unknown[] = [userId]
let paramIndex = 2

if (cursor) {
  conditions.push(`id < $${paramIndex++}`)
  params.push(cursor)
}
if (destination) {
  conditions.push(`destination = $${paramIndex++}`)
  params.push(destination)
}
if (search) {
  conditions.push(`title ILIKE $${paramIndex++}`)
  params.push(`%${search}%`)
}
```

### Técnica do Limit + 1
```typescript
// Busca 1 a mais para saber se tem próxima página
const clips = await pool.query(
  `SELECT * FROM clips WHERE ${whereCond}
   ORDER BY created_at DESC, id DESC
   LIMIT $${paramIndex}`,
  [...params, limit + 1]
)

const hasMore = clips.length > limit
if (hasMore) clips.pop()

const nextCursor = clips.length > 0 ? clips[clips.length - 1].id : null
```

### Frontend
```typescript
function History() {
  const [clips, setClips] = useState<Clip[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)

  // Load more: anexa ao array existente
  const handleLoadMore = async () => {
    const res = await getHistory(token, { cursor: nextCursor })
    setClips(prev => [...prev, ...res.clips])
    setNextCursor(res.nextCursor)
  }
}
```

## Lições Aprendidas
- Ordenação composta `created_at DESC, id DESC` evita registros pulados
- Cursor sempre é o último ID da página (não o primeiro)
- Limit + 1 é mais eficiente que COUNT(*) para detectar próxima página
- Nunca use OFFSET para dados que crescem — é armadilha de performance
