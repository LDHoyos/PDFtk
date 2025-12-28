const { createClient } = require('@supabase/supabase-js')

// Lazy initialization of Supabase client
let supabaseClient = null

function getSupabaseClient() {
    if (!supabaseClient) {
        const url = process.env.SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file')
        }

        supabaseClient = createClient(url, key)
    }
    return supabaseClient
}

async function downloadTemplate() {
    const bucket = process.env.PDF_TEMPLATE_BUCKET
    const path = process.env.PDF_TEMPLATE_PATH

    const supabase = getSupabaseClient()

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60)

    if (error || !data) {
        throw new Error('Failed to create signed URL for template')
    }

    const response = await fetch(data.signedUrl)
    if (!response.ok) {
        throw new Error('Failed to download template')
    }

    return await response.arrayBuffer()
}

module.exports = { downloadTemplate }
