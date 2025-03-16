import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import CustomText from "./CustomText";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component to display page numbers
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme();

  // Generate array of page numbers to display
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <View style={styles.paginationContainer}>
      {pageNumbers.map((page) => (
        <TouchableOpacity
          key={page}
          style={[
            styles.pageButton,
            currentPage === page && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onPageChange(page)}
        >
          <CustomText
            style={{
              color:
                currentPage === page
                  ? theme.colors.onPrimary
                  : theme.colors.onBackground,
            }}
          >
            {page}
          </CustomText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    flexWrap: "wrap",
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    backgroundColor: "#f0f0f0",
  },
});

export default Pagination;
