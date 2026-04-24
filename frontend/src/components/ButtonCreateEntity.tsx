import { COLORS, SPACING } from '../constants/themes'

export const ButtonCreateEntity = ({ bgColor, onClick, icon, title }: { bgColor?: string; onClick: () => void; icon?: React.ReactNode, title: string }) => {
  return (
    <button style={{ ...styles.button, backgroundColor: bgColor ?? COLORS.primary }} onClick={onClick}>
      {icon}
      {title}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    color: COLORS.neutral.white,
    fontSize: `${SPACING.md}px`,
    border: 'none',
    cursor: 'pointer',
    padding: `${SPACING.sm + 4}px ${SPACING.lg}px`,
    borderRadius: `${SPACING.xl}px`,
  },
};