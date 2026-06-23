import { PrivateShell } from "@/components/layout/private-shell";
import { FlashMessage } from "@/components/ui/flash-message";
import { PasswordInput } from "@/components/ui/password-input";
import { updatePasswordAction } from "@/lib/actions/private-actions";

type SettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function asString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const success = asString(params.success);
  const error = asString(params.error);

  return (
    <PrivateShell
      title="Configuración"
      subtitle="Seguridad de la cuenta"
    >
      {success ? <FlashMessage kind="success" message={success} /> : null}
      {error ? <FlashMessage kind="error" message={error} /> : null}

      <section className="panel-block">
        <h2>Seguridad</h2>
        <p className="muted">
          La contraseña debe tener al menos 8 caracteres, una mayúscula, un número
          y un carácter especial.
        </p>
        <form action={updatePasswordAction} className="stack-form">
          <PasswordInput
            name="oldPassword"
            label="Contraseña anterior"
            required
            minLength={1}
            autoComplete="current-password"
          />
          <PasswordInput
            name="password"
            label="Nueva contraseña"
            required
            minLength={8}
            autoComplete="new-password"
            hint="Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial"
          />
          <PasswordInput
            name="confirmPassword"
            label="Confirmar contraseña"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button className="button button-primary" type="submit">
            Guardar contraseña
          </button>
        </form>
      </section>
    </PrivateShell>
  );
}
