// services/firebase/userStatsService.ts
import { COLLECTIONS } from "@config/constants";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { calculateStreak } from "@src/utils/dateUtils";

export interface Stats {
  currentStreak: number;
  lastCompleted: FirebaseFirestoreTypes.Timestamp;
  longestStreak: number;
  minutesSpentToday: number;
  minutesSpentTotal: number;
  todayAnsweredQuestions: number;
  todayCorrectAnsweredQuestions: number;
  todayWrongAnsweredQuestions: number;
  totalAnsweredQuestions: number;
  weeklyCorrectAnswers: number;
}

const fetchStats = (
  userId: string,
  onStatsChange: (stats: Stats | null) => void
) => {
  return firestore()
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          const statsData = doc.data() as Stats;
          onStatsChange(statsData);
        } else {
          onStatsChange(null);
        }
      },
      (error) => {
        console.error("Error fetching stats:", error);
        onStatsChange(null);
      }
    );
};

const fetchLeaderboard = (
  onLeadersChange: (
    leaders: { id: string; name: string; score: number }[]
  ) => void
) => {
  return firestore()
    .collection(COLLECTIONS.USERS)
    .orderBy("weeklyCorrectAnswers", "desc")
    .limit(20)
    .onSnapshot(
      async (snapshot) => {
        const leaders = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              score: data.weeklyCorrectAnswers,
            };
          })
        );

        // Filter out users with a score of 0
        const filteredLeaders = leaders.filter((leader) => leader.score > 0);
        onLeadersChange(filteredLeaders);
      },
      (error) => {
        console.error("Error fetching leaders:", error);
        onLeadersChange([]);
      }
    );
};

const updateUserStats = async (
  userId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<void> => {
  try {
    const userStatsRef = firestore().collection(COLLECTIONS.USERS).doc(userId);
    const userStatsSnapshot = await userStatsRef.get();

    let userStats: Stats;
    if (userStatsSnapshot.exists) {
      userStats = userStatsSnapshot.data() as Stats;
    } else {
      userStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalAnsweredQuestions: 0,
        todayAnsweredQuestions: 0,
        todayCorrectAnsweredQuestions: 0,
        todayWrongAnsweredQuestions: 0,
        minutesSpentToday: 0,
        minutesSpentTotal: 0,
        lastCompleted: firestore.Timestamp.fromDate(new Date(0)),
        weeklyCorrectAnswers: 0,
      };
    }

    let newTodayAnsweredQuestions = userStats.todayAnsweredQuestions ?? 0;
    let newMinutesSpentToday = userStats.minutesSpentToday ?? 0;

    const newCurrentStreak = calculateStreak(
      userStats.lastCompleted || firestore.Timestamp.fromDate(new Date(0)),
      userStats.currentStreak ?? 0
    );
    const newLongestStreak = Math.max(
      userStats.longestStreak ?? 0,
      newCurrentStreak
    );

    const newTotalAnsweredQuestions =
      (userStats.totalAnsweredQuestions ?? 0) + 1;
    newTodayAnsweredQuestions += 1;

    const newTodayCorrectAnsweredQuestions = isCorrect
      ? (userStats.todayCorrectAnsweredQuestions ?? 0) + 1
      : userStats.todayCorrectAnsweredQuestions ?? 0;

    const newTodayWrongAnsweredQuestions = !isCorrect
      ? (userStats.todayWrongAnsweredQuestions ?? 0) + 1
      : userStats.todayWrongAnsweredQuestions ?? 0;

    newMinutesSpentToday += timeSpent;
    const newMinutesSpentTotal = (userStats.minutesSpentTotal ?? 0) + timeSpent;

    const newWeeklyCorrectAnswers = isCorrect
      ? (userStats.weeklyCorrectAnswers ?? 0) + 1
      : userStats.weeklyCorrectAnswers ?? 0;

    await userStatsRef.update({
      totalAnsweredQuestions: newTotalAnsweredQuestions,
      todayAnsweredQuestions: newTodayAnsweredQuestions,
      todayCorrectAnsweredQuestions: newTodayCorrectAnsweredQuestions,
      todayWrongAnsweredQuestions: newTodayWrongAnsweredQuestions,
      minutesSpentToday: newMinutesSpentToday,
      minutesSpentTotal: newMinutesSpentTotal,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      weeklyCorrectAnswers: newWeeklyCorrectAnswers,
      lastCompleted: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    throw new Error("Failed to update user stats.");
  }
};

export default {
  fetchStats,
  fetchLeaderboard,
  updateUserStats,
};
