import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { getStartOfToday, getStartOfYesterday } from "@src/utils/dateUtils";

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalStudiedCards: number;
  todayStudiedCards: number;
  dailyAverage: number;
  minutesSpentToday: number;
  minutesSpentTotal: number;
  todayTotalCards: number;
  correctAnswers: number;
  lastStudiedDate: FirebaseFirestoreTypes.Timestamp;
}

export interface LearningCard {
  id: string;
  type: "multiple_choice" | "fill_in_the_blank";
  question: string;
  image?: string;
  options?: string[];
  answer: string;
  translation: string;
  baseForm: string;
  displayOrder: number;
  audio?: string;
  extraInfo?: string;
  level?: string;
  tags?: string;
}

export const updateCompletionDate = async (userId: string): Promise<void> => {
  try {
    await firestore().collection("users").doc(userId).update({
      lastCompleted: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating completion date: ", error);
    throw new Error("Failed to update completion date.");
  }
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await firestore().collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return false;
    }
    const data = userDoc.data();
    return Boolean(data?.isAdmin);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const checkIfCompletedToday = async (
  userId: string
): Promise<boolean> => {
  try {
    const userDoc = await firestore().collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (userData?.lastCompleted) {
      const lastCompleted = new Date(userData.lastCompleted.seconds * 1000);
      const startOfToday = getStartOfToday();

      if (lastCompleted >= startOfToday) {
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking completion status: ", error);
  }
  return false;
};

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
        const cards = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as LearningCard)
        );
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
        dailyAverage: 0,
        minutesSpentToday: 0,
        minutesSpentTotal: 0,
        todayTotalCards: 0,
        correctAnswers: 0,
        lastStudiedDate: firestore.Timestamp.fromDate(new Date(0)), // Initialize to epoch
      };
    }

    const startOfToday = getStartOfToday();
    const lastStudiedDate = userStats.lastStudiedDate.toDate();

    // Reset today's stats if the last studied date is before today
    let newTodayStudiedCards = userStats.todayStudiedCards;
    let newMinutesSpentToday = userStats.minutesSpentToday;
    let newTodayTotalCards = userStats.todayTotalCards;

    if (lastStudiedDate < startOfToday) {
      newTodayStudiedCards = 0;
      newMinutesSpentToday = 0;
      newTodayTotalCards = 0;
    }

    const newCurrentStreak = updateStreak(
      userStats.lastStudiedDate,
      userStats.currentStreak
    );
    const newLongestStreak = Math.max(
      userStats.longestStreak,
      newCurrentStreak
    );

    const newTotalStudiedCards = userStats.totalStudiedCards + 1;
    newTodayStudiedCards += 1;
    newTodayTotalCards += 1;

    newMinutesSpentToday += timeSpent;
    const newMinutesSpentTotal = userStats.minutesSpentTotal + timeSpent;

    const daysActive = Math.ceil(newMinutesSpentTotal / (24 * 60));
    const newDailyAverage = newTotalStudiedCards / daysActive;

    await userStatsRef.set({
      totalStudiedCards: newTotalStudiedCards,
      todayStudiedCards: newTodayStudiedCards,
      todayTotalCards: newTodayTotalCards,
      minutesSpentToday: newMinutesSpentToday,
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

export const addCard = async (card: LearningCard) => {
  try {
    const newCard = await firestore().collection("learningCards").add(card);
    console.log("Card added with ID:", newCard.id);
    return { success: true, id: newCard.id };
  } catch (error) {
    console.error("Error adding card:", error);
    return { success: false, error };
  }
};

export const updateCard = async (
  cardId: string,
  updatedCard: Partial<LearningCard>
) => {
  try {
    await firestore()
      .collection("learningCards")
      .doc(cardId)
      .update(updatedCard);
    console.log("Card updated with ID:", cardId);
    return { success: true };
  } catch (error) {
    console.error("Error updating card:", error);
    return { success: false, error };
  }
};

export const deleteCard = async (cardId: string) => {
  try {
    await firestore().collection("learningCards").doc(cardId).delete();
    console.log("Card deleted with ID:", cardId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error };
  }
};
