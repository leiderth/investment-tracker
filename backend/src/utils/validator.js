// backend/src/utils/validator.js

/**
 * Validador centralizado para todas las operaciones
 * Proporciona métodos reutilizables para validar datos
 */

class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class Validator {
  /**
   * Valida email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
   */
  static isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Valida que sea positivo
   */
  static isPositive(number) {
    return !isNaN(number) && Number(number) > 0;
  }

  /**
   * Valida que sea no negativo
   */
  static isNonNegative(number) {
    return !isNaN(number) && Number(number) >= 0;
  }

  /**
   * Valida formato de fecha (YYYY-MM-DD)
   */
  static isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Valida que una fecha no sea futura
   */
  static isPastOrToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }

  /**
   * Valida que una fecha sea futura
   */
  static isFuture(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }

  /**
   * Valida que sea un enum válido
   */
  static isValidEnum(value, allowedValues) {
    return allowedValues.includes(value);
  }

  /**
   * Valida que no esté vacío
   */
  static isNotEmpty(value) {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Valida longitud mínima
   */
  static minLength(value, length) {
    return String(value).length >= length;
  }

  /**
   * Valida longitud máxima
   */
  static maxLength(value, length) {
    return String(value).length <= length;
  }

  /**
   * Valida rangos numéricos
   */
  static isInRange(value, min, max) {
    const num = Number(value);
    return num >= min && num <= max;
  }

  /**
   * Validador de inversión (nueva)
   */
  static validateInvestment(data) {
    const errors = [];

    // Type
    if (!this.isNotEmpty(data.type)) {
      errors.push({ field: 'type', message: 'El tipo de inversión es requerido' });
    } else if (!this.isValidEnum(data.type, ['CDT', 'acciones', 'ETF', 'cripto', 'negocio', 'otro'])) {
      errors.push({ field: 'type', message: 'Tipo de inversión no válido' });
    }

    // Platform
    if (!this.isNotEmpty(data.platform)) {
      errors.push({ field: 'platform', message: 'La plataforma es requerida' });
    } else if (!this.maxLength(data.platform, 100)) {
      errors.push({ field: 'platform', message: 'La plataforma no puede exceder 100 caracteres' });
    }

    // Initial amount
    if (!this.isNotEmpty(data.initial_amount)) {
      errors.push({ field: 'initial_amount', message: 'El monto inicial es requerido' });
    } else if (!this.isPositive(data.initial_amount)) {
      errors.push({ field: 'initial_amount', message: 'El monto inicial debe ser mayor a cero' });
    }

    // Start date
    if (!this.isNotEmpty(data.start_date)) {
      errors.push({ field: 'start_date', message: 'La fecha de inicio es requerida' });
    } else if (!this.isValidDate(data.start_date)) {
      errors.push({ field: 'start_date', message: 'La fecha debe estar en formato YYYY-MM-DD' });
    } else if (!this.isPastOrToday(data.start_date)) {
      errors.push({ field: 'start_date', message: 'La fecha de inicio no puede ser futura' });
    }

    // End date (opcional pero validar si existe)
    if (data.end_date && !this.isValidDate(data.end_date)) {
      errors.push({ field: 'end_date', message: 'La fecha debe estar en formato YYYY-MM-DD' });
    }

    // Expected return (opcional)
    if (data.expected_return && !this.isNonNegative(data.expected_return)) {
      errors.push({ field: 'expected_return', message: 'El rendimiento esperado debe ser no negativo' });
    }

    // Risk level
    if (data.risk_level && !this.isValidEnum(data.risk_level, ['bajo', 'medio', 'alto'])) {
      errors.push({ field: 'risk_level', message: 'Nivel de riesgo no válido' });
    }

    return errors;
  }

  /**
   * Validador de meta financiera (nueva)
   */
  static validateFinancialGoal(data) {
    const errors = [];

    // Name
    if (!this.isNotEmpty(data.name)) {
      errors.push({ field: 'name', message: 'El nombre de la meta es requerido' });
    } else if (!this.minLength(data.name, 3) || !this.maxLength(data.name, 200)) {
      errors.push({ field: 'name', message: 'El nombre debe tener entre 3 y 200 caracteres' });
    }

    // Target amount
    if (!this.isNotEmpty(data.target_amount)) {
      errors.push({ field: 'target_amount', message: 'El monto objetivo es requerido' });
    } else if (!this.isPositive(data.target_amount)) {
      errors.push({ field: 'target_amount', message: 'El monto objetivo debe ser mayor a cero' });
    }

    // Deadline
    if (!this.isNotEmpty(data.deadline)) {
      errors.push({ field: 'deadline', message: 'La fecha límite es requerida' });
    } else if (!this.isValidDate(data.deadline)) {
      errors.push({ field: 'deadline', message: 'La fecha debe estar en formato YYYY-MM-DD' });
    } else if (!this.isFuture(data.deadline)) {
      errors.push({ field: 'deadline', message: 'La fecha límite debe ser futura' });
    }

    // Monthly savings (opcional pero validar si existe)
    if (data.monthly_savings && !this.isPositive(data.monthly_savings)) {
      errors.push({ field: 'monthly_savings', message: 'El ahorro mensual debe ser mayor a cero' });
    }

    return errors;
  }

  /**
   * Validador de transacción
   */
  static validateTransaction(data) {
    const errors = [];

    // Type
    if (!this.isNotEmpty(data.type)) {
      errors.push({ field: 'type', message: 'El tipo de transacción es requerido' });
    } else if (!this.isValidEnum(data.type, ['deposit', 'withdrawal', 'dividend', 'fee'])) {
      errors.push({ field: 'type', message: 'Tipo de transacción no válido' });
    }

    // Amount
    if (!this.isNotEmpty(data.amount)) {
      errors.push({ field: 'amount', message: 'El monto es requerido' });
    } else if (!this.isPositive(data.amount)) {
      errors.push({ field: 'amount', message: 'El monto debe ser mayor a cero' });
    }

    // Date
    if (!this.isNotEmpty(data.date)) {
      errors.push({ field: 'date', message: 'La fecha es requerida' });
    } else if (!this.isValidDate(data.date)) {
      errors.push({ field: 'date', message: 'La fecha debe estar en formato YYYY-MM-DD' });
    } else if (!this.isPastOrToday(data.date)) {
      errors.push({ field: 'date', message: 'La fecha no puede ser futura' });
    }

    return errors;
  }

  /**
   * Validador de simulación
   */
  static validateSimulation(data) {
    const errors = [];

    // Initial amount
    if (data.initial_amount !== undefined && data.initial_amount !== null) {
      const amount = Number(data.initial_amount);
      if (isNaN(amount) || amount < 0) {
        errors.push({ field: 'initial_amount', message: 'El monto inicial debe ser un número no negativo' });
      }
    } else {
      errors.push({ field: 'initial_amount', message: 'El monto inicial es requerido' });
    }

    // Monthly contribution
    if (data.monthly_contribution !== undefined && data.monthly_contribution !== null) {
      const amount = Number(data.monthly_contribution);
      if (isNaN(amount) || amount < 0) {
        errors.push({ field: 'monthly_contribution', message: 'El aporte mensual debe ser un número no negativo' });
      }
    }

    // Annual return
    if (data.annual_return_percentage !== undefined && data.annual_return_percentage !== null) {
      const rate = Number(data.annual_return_percentage);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.push({ field: 'annual_return_percentage', message: 'La tasa anual debe estar entre 0 y 100' });
      }
    } else {
      errors.push({ field: 'annual_return_percentage', message: 'La tasa anual es requerida' });
    }

    // Years
    if (data.years !== undefined && data.years !== null) {
      const years = Number(data.years);
      if (!Number.isInteger(years) || years < 1 || years > 50) {
        errors.push({ field: 'years', message: 'Los años deben ser un número entero entre 1 y 50' });
      }
    } else {
      errors.push({ field: 'years', message: 'Los años son requeridos' });
    }

    return errors;
  }

  /**
   * Validador de meta financiera con análisis
   */
  static validateGoalAnalysis(data) {
    const errors = [];

    // Target amount
    if (data.target_amount !== undefined && data.target_amount !== null) {
      const amount = Number(data.target_amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({ field: 'target_amount', message: 'El monto objetivo debe ser mayor a cero' });
      }
    } else {
      errors.push({ field: 'target_amount', message: 'El monto objetivo es requerido' });
    }

    // Initial amount
    if (data.initial_amount !== undefined && data.initial_amount !== null) {
      const amount = Number(data.initial_amount);
      if (isNaN(amount) || amount < 0) {
        errors.push({ field: 'initial_amount', message: 'El monto inicial debe ser no negativo' });
      }
    }

    // Annual return
    if (data.annual_return_percentage !== undefined && data.annual_return_percentage !== null) {
      const rate = Number(data.annual_return_percentage);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.push({ field: 'annual_return_percentage', message: 'La tasa anual debe estar entre 0 y 100' });
      }
    }

    // Years
    if (data.years !== undefined && data.years !== null) {
      const years = Number(data.years);
      if (!Number.isInteger(years) || years < 1 || years > 50) {
        errors.push({ field: 'years', message: 'Los años deben ser un número entero entre 1 y 50' });
      }
    } else {
      errors.push({ field: 'years', message: 'Los años son requeridos' });
    }

    return errors;
  }

  /**
   * Validador de análisis de sensibilidad
   */
  static validateSensitivityAnalysis(data) {
    const errors = [];

    // Base rate
    if (data.base_rate !== undefined && data.base_rate !== null) {
      const rate = Number(data.base_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.push({ field: 'base_rate', message: 'La tasa base debe estar entre 0 y 100' });
      }
    }

    // Variation
    if (data.variation !== undefined && data.variation !== null) {
      const variation = Number(data.variation);
      if (isNaN(variation) || variation < 0 || variation > 50) {
        errors.push({ field: 'variation', message: 'La variación debe estar entre 0 y 50' });
      }
    }

    return errors;
  }
}

module.exports = { Validator, ValidationError };
