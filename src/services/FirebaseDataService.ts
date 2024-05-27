import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { getStartOfToday, getStartOfYesterday, getStartOfWeek } from "@src/utils/dateUtils";

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalStudiedCards: number;
  todayStudiedCards: number;
  weeklyStudiedCards: number;
  dailyAverage: number;
  minutesSpentToday: number;
  minutesSpentThisWeek: number;
  minutesSpentTotal: number;
  todayTotalCards: number;
  correctAnswers: number;
  lastStudiedDate: FirebaseFirestoreTypes.Timestamp; // Use Firestore Timestamp
}

export interface LearningCard {
  type: "multiple_choice" | "fill_in_the_blank" | "true_false";
  question: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
}

export const fetchStats = (
  userId: string,
  onStatsChange: (stats: Stats | null) => void
) => {
  return firestore()
    .collection("stats")
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

export const fetchLearningCards = (
  onCardsChange: (cards: LearningCard[]) => void
) => {
  return firestore()
    .collection("learningCards")
    .onSnapshot(
      (snapshot) => {
        const cards = snapshot.docs.map((doc) => doc.data() as LearningCard);
        onCardsChange(cards);
      },
      (error) => {
        console.error("Error fetching learning cards:", error);
        onCardsChange([]); // Ensure we handle errors by passing an empty array
      }
    );
};

export const fetchLeaderboard = (
  onLeadersChange: (
    leaders: { id: string; name: string; score: number }[]
  ) => void
) => {
  return firestore()
    .collection("stats")
    .orderBy("totalStudiedCards", "desc")
    .limit(20)
    .onSnapshot(
      async (snapshot) => {
        const leaders = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await firestore()
              .collection("users")
              .doc(doc.id)
              .get();
            const userName = userDoc.exists ? userDoc.data()?.name : "Unknown";
            return {
              id: doc.id,
              name: userName,
              score: data.totalStudiedCards,
            };
          })
        );
        onLeadersChange(leaders);
      },
      (error) => {
        console.error("Error fetching leaders:", error);
        onLeadersChange([]);
      }
    );
};

const updateStreak = (
  lastStudiedDate: FirebaseFirestoreTypes.Timestamp,
  currentStreak: number
): number => {
  const lastStudied = lastStudiedDate.toDate();
  const startOfToday = getStartOfToday();
  const startOfYesterday = getStartOfYesterday();

  if (lastStudied >= startOfToday) {
    return currentStreak; // Already studied today, no change
  } else if (lastStudied >= startOfYesterday) {
    return currentStreak + 1; // Continued the streak from yesterday
  } else {
    return 1; // Streak broken, reset to 1
  }
};

const updateWeeklyStats = (
  lastStudiedDate: FirebaseFirestoreTypes.Timestamp,
  weeklyStudiedCards: number,
  minutesSpentThisWeek: number,
  newTodayStudiedCards: number,
  newMinutesSpentToday: number
) => {
  const lastStudied = lastStudiedDate.toDate();
  const startOfWeek = getStartOfWeek();

  if (lastStudied >= startOfWeek) {
    return {
      newWeeklyStudiedCards: weeklyStudiedCards + newTodayStudiedCards,
      newMinutesSpentThisWeek: minutesSpentThisWeek + newMinutesSpentToday,
    };
  } else {
    return {
      newWeeklyStudiedCards: newTodayStudiedCards,
      newMinutesSpentThisWeek: newMinutesSpentToday,
    };
  }
};

export const updateUserStats = async (
  userId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<void> => {
  try {
    const userStatsRef = firestore().collection("stats").doc(userId);
    const userStatsSnapshot = await userStatsRef.get();

    let userStats: Stats;
    if (userStatsSnapshot.exists) {
      userStats = userStatsSnapshot.data() as Stats;
    } else {
      userStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalStudiedCards: 0,
        todayStudiedCards: 0,
        weeklyStudiedCards: 0,
        dailyAverage: 0,
        minutesSpentToday: 0,
        minutesSpentThisWeek: 0,
        minutesSpentTotal: 0,
        todayTotalCards: 0,
        correctAnswers: 0,
        lastStudiedDate: firestore.Timestamp.fromDate(new Date(0)), // Initialize to epoch
      };
    }

    const newCurrentStreak = updateStreak(userStats.lastStudiedDate, userStats.currentStreak);
    const newLongestStreak = Math.max(userStats.longestStreak, newCurrentStreak);

    const newTotalStudiedCards = userStats.totalStudiedCards + 1;
    const newTodayStudiedCards = userStats.todayStudiedCards + 1;
    const newTodayTotalCards = userStats.todayTotalCards + 1;

    const newMinutesSpentToday = userStats.minutesSpentToday + timeSpent;
    const newMinutesSpentTotal = userStats.minutesSpentTotal + timeSpent;

    const { newWeeklyStudiedCards, newMinutesSpentThisWeek } = updateWeeklyStats(
      userStats.lastStudiedDate,
      userStats.weeklyStudiedCards,
      userStats.minutesSpentThisWeek,
      newTodayStudiedCards,
      newMinutesSpentToday
    );

    const daysActive = Math.ceil(newMinutesSpentTotal / (24 * 60));
    const newDailyAverage = newTotalStudiedCards / daysActive;

    await userStatsRef.set({
      totalStudiedCards: newTotalStudiedCards,
      todayStudiedCards: newTodayStudiedCards,
      weeklyStudiedCards: newWeeklyStudiedCards,
      todayTotalCards: newTodayTotalCards,
      minutesSpentToday: newMinutesSpentToday,
      minutesSpentThisWeek: newMinutesSpentThisWeek,
      minutesSpentTotal: newMinutesSpentTotal,
      dailyAverage: newDailyAverage,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      correctAnswers: isCorrect
        ? userStats.correctAnswers + 1
        : userStats.correctAnswers,
      lastStudiedDate: firestore.Timestamp.now(), // Update to current time
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    throw new Error("Failed to update user stats.");
  }
};
