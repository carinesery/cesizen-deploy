import { COLORS, SPACING } from '../constants/themes'

export const ButtonAction = ({ bgColor, onClick, icon }: { bgColor?: string; onClick: () => void; icon?: React.ReactNode }) => {
  return (
    <button style={{ ...styles.button, backgroundColor: bgColor ?? COLORS.primary }} onClick={onClick}>
      {icon}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.neutral.white,
    border: 'none',
    cursor: 'pointer',
    padding: `${SPACING.sm}px`,
    borderRadius: `${SPACING.lg}px`,
  },
};