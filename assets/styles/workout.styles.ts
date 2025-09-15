import COLORS from "@/constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  username: {
    color: COLORS.cardBackground,
    fontSize: 16,
    fontWeight: '500',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
  },
  headerBadge: {
    backgroundColor: COLORS.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  activeTabText: {
    color: COLORS.textPrimary,
  },
  tabContent: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  exerciseNumber: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  exerciseDetails: {
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'flex-start',
  },
  exerciseDetail: {
    flexDirection: 'row',
    gap: 20,
  },
  exerciseDetailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "left",
  },
  toggleText: {
    fontSize: 16,
    color: COLORS.placeholderText
  },
  toggleView: {
    flexDirection: 'row',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 24,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: undefined,
    width: '100%',
  },
  pauseButton: {
    backgroundColor: COLORS.red,
  },
  completeButton: {
    backgroundColor: COLORS.green,
  },
  copyButton: {
    backgroundColor: COLORS.blue,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  setDetails: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 2,
  },
  volumeText: {
    fontSize: 12,
    color: '#666666',
  },
  setItem: {
    flexDirection: 'row',
    // alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingBottom: 12,
    gap: 12,
  },
  completedSet: {
    backgroundColor: '#E8F5E8',
    borderColor: '#C8E6C9',
  },
  pendingSet: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
  }
})

export default styles