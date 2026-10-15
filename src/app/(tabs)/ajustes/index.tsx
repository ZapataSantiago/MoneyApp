import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Ajustes() {
  return (
    <Screen title="Ajustes">
      <Section>
        <Row emoji="👛" title="Cuentas" />
        <Row emoji="🧩" title="Grupos" />
        <Row emoji="🏷️" title="Categorías" />
      </Section>
    </Screen>
  );
}
