import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { cpf } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'cpf', async: false })
export class CpfValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    return cpf.isValid(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'CPF ($value) is not valid';
  }
}
