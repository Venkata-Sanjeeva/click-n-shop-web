
export default function ValidateFields(fieldValues) {

    const errorObj = {};

    Object.entries(fieldValues).forEach(([key, value]) => {
        
        if (!value) {
            errorObj[key] = `${key.substring(0, 1).toUpperCase() + (key === "dob" ? "ate Of Birth" : key.substring(1))} is a required field.`;
        }
    });
    
    return errorObj;
}