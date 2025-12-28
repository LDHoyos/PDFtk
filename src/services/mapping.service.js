/**
 * Mapea datos del intake al formato FDF para PDFtk
 * 
 * Basado en el mapeo exitoso proporcionado por el usuario
 */
function mapIntakeToFDF(intakeData, clientData) {
    const personal = intakeData?.personal_info || {}
    const processing = intakeData?.processing_info || {}
    const persecution = intakeData?.persecution || {}
    const spouse = intakeData?.spouse || {}

    // Limpieza de teléfono
    const rawPhone = personal.phone || ''
    const cleanPhone = rawPhone.replace(/\D/g, '')

    // Mapeo de campos basado en la versión funcional del usuario
    const fields = {
        // Información Personal
        'form1[0].#subform[0].PtAILine4_LastName[0]': personal.last_name || '',
        'form1[0].#subform[0].PtAILine5_FirstName[0]': personal.first_name || '',
        'form1[0].#subform[0].PtAILine6_MiddleName[0]': personal.middle_name || '',
        'form1[0].#subform[0].PtAILine1_ANumber[0]': personal.a_number || '',
        'form1[0].#subform[0].TextField1[0]': personal.ssn || '',
        'form1[0].#subform[0].DateTimeField1[0]': personal.date_of_birth || '',
        'form1[0].#subform[0].TextField1[3]': personal.nationality || '',

        // Checkboxes: Sexo (Normalizado a Technical Keys)
        ...(personal.gender === 'male' ? { 'form1[0].#subform[0].PartALine9Sex[0]': 'M' } : {}),
        ...(personal.gender === 'female' ? { 'form1[0].#subform[0].PartALine9Sex[1]': 'F' } : {}),

        // Checkboxes: Estado Civil (Normalizado a Technical Keys)
        ...(personal.marital_status === 'single' ? { 'form1[0].#subform[0].Marital[0]': 'S' } : {}),
        ...(personal.marital_status === 'married' ? { 'form1[0].#subform[0].Marital[1]': 'M' } : {}),

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

        // Teléfono (dividido en Area Code y Number)
        'form1[0].#subform[0].PtAILine8_AreaCode[0]': cleanPhone.slice(0, 3) || '',
        'form1[0].#subform[0].PtAILine8_TelephoneNumber[0]': cleanPhone.slice(3) || '',

        // Procesamiento
        'form1[0].#subform[0].TextField3[0]': processing.i94_number || '',

        // Cónyuge (si aplica)
        ...(spouse.include_in_application ? {
            'form1[0].#subform[1].NotMarried[0].PtAIILine5_LastName[0]': spouse.last_name || '',
            'form1[0].#subform[1].NotMarried[0].PtAIILine6_FirstName[0]': spouse.first_name || '',
            'form1[0].#subform[1].NotMarried[0].DateTimeField7[0]': spouse.date_of_birth || ''
        } : {})
    }

    return fields
}

module.exports = { mapIntakeToFDF }
