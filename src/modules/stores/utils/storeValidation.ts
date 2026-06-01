/**
 * Strict enterprise-grade validation rules for Store attributes.
 */

// Valid postal/zip code matching backend rule: 3-16 chars starting with alphanumeric, followed by alphanumeric, spaces, or hyphens
const POSTAL_CODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,15}$/;

// RFC-compliant email matching
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// NANP Phone regex matching common US/Canada phone formats
// Supporting: +1XXXXXXXXXX, (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX XXX XXXX
const PHONE_REGEX = /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

// Special characters except "-" and alphanumeric characters
const STORE_CODE_REGEX = /^[A-Z0-9-]+$/;

export interface StoreValidationErrors {
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    city?: string;
    province?: string;
    timezone?: string;
    address?: string;
    postalCode?: string;
    latitude?: string;
    longitude?: string;
    deliveryRadiusKm?: string;
}

export function validateStoreName(name: string): string | undefined {
    const val = name.trim();
    if (!val) return 'Store name is required';
    if (val.length < 3) return 'Store name must be at least 3 characters';
    if (val.length > 100) return 'Store name cannot exceed 100 characters';
    if (/^[0-9]+$/.test(val)) return 'Store name cannot consist only of numbers';
    return undefined;
}

export function validateStoreCode(code: string): string | undefined {
    const val = code.trim().toUpperCase();
    if (!val) return 'Store code is required';
    if (!STORE_CODE_REGEX.test(val)) {
        return 'Store code can only contain uppercase letters, numbers, and hyphens';
    }
    return undefined;
}

export function validateStoreEmail(email: string): string | undefined {
    const val = email.trim();
    if (!val) return 'Email is required';
    if (!EMAIL_REGEX.test(val)) return 'Please enter a valid RFC-compliant email address';
    return undefined;
}

export function validateStorePhone(phone: string): string | undefined {
    const val = phone.trim();
    if (!val) return 'Phone number is required';
    if (!PHONE_REGEX.test(val)) {
        return 'Invalid US/Canada phone format. Try: (555) 555-5555 or 555-555-5555';
    }
    return undefined;
}

export function validateStoreAddress(address: string): string | undefined {
    const val = address.trim();
    if (!val) return 'Street address is required';
    if (val.length < 5) return 'Please enter a complete street address (min 5 chars)';
    return undefined;
}

export function validateStorePostalCode(postalCode: string): string | undefined {
    const val = postalCode.trim();
    if (!val) return 'Postal or ZIP code is required';
    if (!POSTAL_CODE_REGEX.test(val)) {
        return 'Must be a valid Postal/ZIP code (3 to 16 alphanumeric characters, spaces, or hyphens)';
    }
    return undefined;
}

export function validateCoordinates(latStr: string | number, lngStr: string | number): { latitude?: string; longitude?: string } {
    const errors: { latitude?: string; longitude?: string } = {};
    const lat = typeof latStr === 'number' ? latStr : parseFloat(latStr);
    const lng = typeof lngStr === 'number' ? lngStr : parseFloat(lngStr);

    if (isNaN(lat)) {
        errors.latitude = 'Latitude must be a valid decimal number';
    } else if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (isNaN(lng)) {
        errors.longitude = 'Longitude must be a valid decimal number';
    } else if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
    }

    return errors;
}

export function validateDeliveryRadius(radius: string | number): string | undefined {
    const val = typeof radius === 'number' ? radius : parseFloat(radius);
    if (isNaN(val)) return 'Delivery radius must be a valid number';
    if (val < 0) return 'Delivery radius cannot be negative';
    if (val > 250) return 'Delivery radius is limited to a maximum of 250 km';
    return undefined;
}
