/**
 * Mapea datos del intake al formato FDF para PDFtk
 * 
 * Basado en el mapeo exitoso proporcionado por el usuario con normalización robusta.
 */
function mapIntakeToFDF(intakeData, clientData) {
    const personal = intakeData?.personal_info || {}
    const processing = intakeData?.processing_info || {}
    const persecution = intakeData?.persecution || {}
    const spouse = intakeData?.spouse || {}

    // Helpers de Normalización
    const normalizeGender = (val) => {
        if (!val) return ''
        const s = String(val).toLowerCase()
        if (s.includes('male') || s.includes('masculino') || s === 'm' || s === 'hombre') return 'male'
        if (s.includes('female') || s.includes('femenino') || s === 'f' || s === 'mujer') return 'female'
        return ''
    }

    const normalizeMarital = (val) => {
        if (!val) return ''
        const s = String(val).toLowerCase()
        if (s.includes('soltero') || s === 'single' || s === 's') return 'single'
        if (s.includes('casado') || s === 'married' || s === 'm') return 'married'
        if (s.includes('divorciado') || s === 'divorced' || s === 'd') return 'divorced'
        if (s.includes('viudo') || s === 'widowed' || s === 'w') return 'widowed'
        return ''
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return dateStr
            const mm = String(date.getMonth() + 1).padStart(2, '0')
            const dd = String(date.getDate()).padStart(2, '0')
            const yyyy = date.getFullYear()
            return `${mm}/${dd}/${yyyy}`
        } catch (e) {
            return dateStr
        }
    }

    const gender = normalizeGender(personal.gender)
    const marital = normalizeMarital(personal.marital_status)
    const rawPhone = personal.phone || ''
    const cleanPhone = rawPhone.replace(/\D/g, '')

    const fields = {
        // Información Personal
        'form1[0].#subform[0].PtAILine4_LastName[0]': personal.last_name || '',
        'form1[0].#subform[0].PtAILine5_FirstName[0]': personal.first_name || '',
        'form1[0].#subform[0].PtAILine6_MiddleName[0]': personal.middle_name || '',
        'form1[0].#subform[0].PtAILine1_ANumber[0]': personal.a_number || '',
        'form1[0].#subform[0].TextField1[0]': personal.ssn || '',
        'form1[0].#subform[0].DateTimeField1[0]': formatDate(personal.date_of_birth),
        'form1[0].#subform[0].TextField1[3]': personal.nationality || '',
        'form1[0].#subform[0].TextField1[8]': personal.uscis_online_account_number || '',

        // Checkboxes: Sexo (Normalizado a Export Values reales del PDF)
        ...(gender === 'male' ? { 'form1[0].#subform[0].PartALine9Sex[0]': 'M' } : {}),
        ...(gender === 'female' ? { 'form1[0].#subform[0].PartALine9Sex[1]': 'F' } : {}),

        // Checkboxes: Estado Civil (Real Export Values: S, M, D, W)
        ...(marital === 'single' ? { 'form1[0].#subform[0].Marital[0]': 'S' } : {}),
        ...(marital === 'married' ? { 'form1[0].#subform[0].Marital[1]': 'M' } : {}),
        ...(marital === 'divorced' ? { 'form1[0].#subform[0].Marital[2]': 'D' } : {}),
        ...(marital === 'widowed' ? { 'form1[0].#subform[0].Marital[3]': 'W' } : {}),

        // Checkboxes: Corte (A, B, C)
        ...(processing.court_status === 'never' ? { 'form1[0].#subform[0].CheckBox3[0]': 'A' } : {}),
        ...(processing.court_status === 'current' ? { 'form1[0].#subform[0].CheckBox3[2]': 'B' } : {}),
        ...(processing.court_status === 'past' ? { 'form1[0].#subform[0].CheckBox3[1]': 'C' } : {}),

        // Checkboxes: Inglés
        ...(personal.fluent_english ? { 'form1[0].#subform[0].CheckBox4[0]': 'Yes' } : { 'form1[0].#subform[0].CheckBox4[1]': 'No' }),

        // Dirección (Physically Reside)
        'form1[0].#subform[0].PtAILine8_StreetNumandName[0]': personal.current_address?.street || '',
        'form1[0].#subform[0].TextField1[2]': personal.current_address?.city || '',
        'form1[0].#subform[0].PtAILine8_State[0]': personal.current_address?.state || '',
        'form1[0].#subform[0].PtAILine8_Zipcode[0]': personal.current_address?.zip || '',

        // Dirección (Mailing)
        'form1[0].#subform[0].PtAILine9_StreetNumandName[0]': personal.current_address?.street || '',
        'form1[0].#subform[0].PtAILine9_City[0]': personal.current_address?.city || '',
        'form1[0].#subform[0].PtAILine9_State[0]': personal.current_address?.state || '',
        'form1[0].#subform[0].PtAILine9_ZipCode[0]': personal.current_address?.zip || '',

        // Teléfono (Area Code + Number)
        'form1[0].#subform[0].PtAILine8_AreaCode[0]': cleanPhone.slice(0, 3) || '',
        'form1[0].#subform[0].PtAILine8_TelephoneNumber[0]': cleanPhone.slice(3) || '',

        // Procesamiento e Historial de Viajes
        'form1[0].#subform[0].TextField3[0]': processing.i94_number || '',
        'form1[0].#subform[0].DateTimeField6[0]': formatDate(processing.last_leave_date),
        'form1[0].#subform[0].DateTimeField2[0]': formatDate(processing.last_entry_date),
        'form1[0].#subform[0].TextField4[0]': processing.last_entry_location || '',
        'form1[0].#subform[0].TextField4[1]': processing.last_entry_status || '',
        'form1[0].#subform[0].DateTimeField2[1]': formatDate(processing.status_expires),

        // Pasaporte y Documentos
        'form1[0].#subform[0].TextField5[0]': personal.passport_issuer || personal.nationality || '',
        'form1[0].#subform[0].TextField5[1]': personal.passport_number || '',
        'form1[0].#subform[0].DateTimeField2[2]': formatDate(personal.passport_expiration),

        // Idiomas adicionales
        'form1[0].#subform[0].TextField7[1]': personal.other_languages || '',

        // Cónyuge
        ...(spouse.include_in_application ? {
            'form1[0].#subform[1].NotMarried[0].PtAIILine5_LastName[0]': spouse.last_name || '',
            'form1[0].#subform[1].NotMarried[0].PtAIILine6_FirstName[0]': spouse.first_name || '',
            'form1[0].#subform[1].NotMarried[0].DateTimeField7[0]': formatDate(spouse.date_of_birth),
            'form1[0].#subform[1].NotMarried[0].DateTimeField8[0]': formatDate(spouse.date_of_marriage),
            'form1[0].#subform[1].NotMarried[0].TextField10[4]': spouse.place_of_marriage || '',
            'form1[0].#subform[1].NotMarried[0].TextField10[0]': spouse.nationality || '',
        } : {})
    }

    return fields
}

module.exports = { mapIntakeToFDF }
