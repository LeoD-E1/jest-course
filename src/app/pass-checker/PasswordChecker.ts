export enum PasswordErrors {
  SHORT = 'Password is too short',
  NO_UPPER_CASE = 'upper case char is required',
  NO_LOWER_CASE = 'lower case char is required',
  NO_NUMBER = 'At least a number is required!',
}

export interface CheckResult {
  valid: boolean
  reasons: PasswordErrors[]
}

export class PasswordChecker {
  public checkPassword(password: string): CheckResult {
    const reasons: PasswordErrors[] = []
    this.checkForLength(password, reasons)
    this.checkForUpperCase(password, reasons)
    this.checkForLowerCase(password, reasons)

    return {
      valid: !reasons.length,
      reasons: reasons,
    }
  }

  public checkAdminPassword(password: string): CheckResult {
    const basicCheck = this.checkPassword(password)
    this.checkForNumber(password, basicCheck.reasons)
    return {
      valid: !basicCheck.reasons.length,
      reasons: basicCheck.reasons,
    }
  }

  private checkForLength(password: string, reasons: PasswordErrors[]) {
    if (password.length < 8) {
      reasons.push(PasswordErrors.SHORT)
    }
  }

  private checkForUpperCase(password: string, reasons: PasswordErrors[]) {
    if (password === password.toLowerCase()) {
      reasons.push(PasswordErrors.NO_UPPER_CASE)
    }
  }

  private checkForLowerCase(password: string, reasons: PasswordErrors[]) {
    if (password === password.toUpperCase()) {
      reasons.push(PasswordErrors.NO_LOWER_CASE)
    }
  }

  private checkForNumber(password: string, reasons: PasswordErrors[]) {
    const hasNumber = /\d/
    if (!hasNumber.test(password)) {
      reasons.push(PasswordErrors.NO_NUMBER)
    }
  }
}
