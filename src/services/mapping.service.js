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

        // Checkboxes: Sexo (Normalizado a Technical Keys del PDFtk)
        ...(gender === 'male' ? { 'form1[0].#subform[0].PartALine9Sex[0]': '8' } : {}),
        ...(gender === 'female' ? { 'form1[0].#subform[0].PartALine9Sex[1]': '8' } : {}),

        // Checkboxes: Estado Civil
        ...(marital === 'single' ? { 'form1[0].#subform[0].Marital[0]': '8' } : {}),
        ...(marital === 'married' ? { 'form1[0].#subform[0].Marital[1]': '8' } : {}),

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

        // Procesamiento
        'form1[0].#subform[0].TextField3[0]': processing.i94_number || '',

        // Cónyuge
        ...(spouse.include_in_application ? {
            'form1[0].#subform[1].NotMarried[0].PtAIILine5_LastName[0]': spouse.last_name || '',
            'form1[0].#subform[1].NotMarried[0].PtAIILine6_FirstName[0]': spouse.first_name || '',
            'form1[0].#subform[1].NotMarried[0].DateTimeField7[0]': formatDate(spouse.date_of_birth)
        } : {})
    }

    return fields
}

module.exports = { mapIntakeToFDF }
