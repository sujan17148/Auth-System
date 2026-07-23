import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { ControllerRenderProps } from 'react-hook-form';

interface FormOtpProps {
  error?: string;
  length: number;
  field: ControllerRenderProps<any, any>;
}

export default function FormOtp({ length, field, error }: FormOtpProps) {
  return (
    <div className="space-y-1 w-full">
      <InputOTP
        maxLength={length}
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        pattern={REGEXP_ONLY_DIGITS}
      >
        <InputOTPGroup className="flex gap-2 justify-center items-center w-full ">
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className="size-10 border" />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-sm text-center text-destructive">* {error}</p>}
    </div>
  );
}
