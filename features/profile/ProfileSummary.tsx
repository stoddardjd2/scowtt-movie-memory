import { styles } from "@/components/styles";
import { Avatar } from "./Avatar";

type Props = {
  name: string | null;
  email: string;
  photoUrl: string | null;
};

export function ProfileSummary({ name, email, photoUrl }: Props) {
  return (
    <section className={`flex items-center gap-4 ${styles.card}`}>
      <Avatar name={name} email={email} photoUrl={photoUrl} size={56} />
      <div className="min-w-0">
        <h2 className="truncate font-medium text-zinc-950 dark:text-zinc-50">{name ?? email}</h2>
        <p className={`truncate ${styles.muted}`}>{email}</p>
      </div>
    </section>
  );
}
