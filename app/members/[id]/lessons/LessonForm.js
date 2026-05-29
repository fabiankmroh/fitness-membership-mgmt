"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createLessonAction, updateLessonAction } from "../../actions";
import SignaturePad from "./SignaturePad";

const initialState = {
  error: "",
  ok: false,
  redirectTo: ""
};

function getSelectedKey(exercise) {
  return exercise.exerciseCatalogId
    ? `catalog:${exercise.exerciseCatalogId}`
    : `custom:${exercise.customId}`;
}

export default function LessonForm({
  exerciseCategories,
  initialNotes = "",
  initialSelectedExercises = [],
  initialSignatureData = "",
  lessonId = "",
  memberId,
  mode = "create"
}) {
  const router = useRouter();
  const dragStartYRef = useRef(0);
  const action = mode === "edit" ? updateLessonAction : createLessonAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [activeCategoryId, setActiveCategoryId] = useState(
    exerciseCategories[0]?.id || ""
  );
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [draggingKey, setDraggingKey] = useState("");
  const [selectedExercises, setSelectedExercises] = useState(
    initialSelectedExercises
  );

  const activeCategory = useMemo(() => {
    return (
      exerciseCategories.find((category) => category.id === activeCategoryId) ||
      exerciseCategories[0]
    );
  }, [activeCategoryId, exerciseCategories]);

  useEffect(() => {
    if (!state.redirectTo) {
      return;
    }

    router.replace(state.redirectTo);

    const fallbackTimer = window.setTimeout(() => {
      window.location.assign(state.redirectTo);
    }, 500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [router, state.redirectTo]);

  function toggleCatalogExercise(category, exercise) {
    const key = `catalog:${exercise.id}`;

    setSelectedExercises((currentExercises) => {
      const alreadySelected = currentExercises.some((item) => {
        return getSelectedKey(item) === key;
      });

      if (alreadySelected) {
        return currentExercises.filter((item) => getSelectedKey(item) !== key);
      }

      return [
        ...currentExercises,
        {
          categoryId: category.id,
          categoryName: category.name,
          customId: "",
          customName: "",
          exerciseCatalogId: exercise.id,
          memo: "",
          name: exercise.name,
          reps: "",
          sets: "",
          weightKg: ""
        }
      ];
    });
  }

  function addCustomExercise() {
    const trimmedName = customExerciseName.trim();

    if (!trimmedName || !activeCategory) {
      return;
    }

    setSelectedExercises((currentExercises) => [
      ...currentExercises,
      {
        categoryId: activeCategory.id,
        categoryName: activeCategory.name,
        customId: `${Date.now()}-${currentExercises.length}`,
        customName: trimmedName,
        exerciseCatalogId: "",
        memo: "",
        name: trimmedName,
        reps: "",
        sets: "",
        weightKg: ""
      }
    ]);
    setCustomExerciseName("");
  }

  function updateSelectedExercise(key, fieldName, value) {
    setSelectedExercises((currentExercises) =>
      currentExercises.map((exercise) => {
        if (getSelectedKey(exercise) !== key) {
          return exercise;
        }

        return {
          ...exercise,
          [fieldName]: value
        };
      })
    );
  }

  function removeSelectedExercise(key) {
    setSelectedExercises((currentExercises) =>
      currentExercises.filter((exercise) => getSelectedKey(exercise) !== key)
    );
  }

  function moveSelectedExercise(key, direction) {
    setSelectedExercises((currentExercises) => {
      const currentIndex = currentExercises.findIndex((exercise) => {
        return getSelectedKey(exercise) === key;
      });
      const nextIndex = currentIndex + direction;

      if (
        currentIndex === -1 ||
        nextIndex < 0 ||
        nextIndex >= currentExercises.length
      ) {
        return currentExercises;
      }

      const reorderedExercises = [...currentExercises];
      const currentExercise = reorderedExercises[currentIndex];
      reorderedExercises[currentIndex] = reorderedExercises[nextIndex];
      reorderedExercises[nextIndex] = currentExercise;

      return reorderedExercises;
    });
  }

  function startDragging(event, key) {
    setDraggingKey(key);
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function dragExercise(event, key) {
    if (draggingKey !== key) {
      return;
    }

    const distance = event.clientY - dragStartYRef.current;

    if (Math.abs(distance) < 44) {
      return;
    }

    moveSelectedExercise(key, distance > 0 ? 1 : -1);
    dragStartYRef.current = event.clientY;
  }

  function stopDragging(event) {
    if (draggingKey && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggingKey("");
  }

  return (
    <form action={formAction} className="panel formPanel lessonForm">
      <input name="memberId" type="hidden" value={memberId} />
      {mode === "edit" ? (
        <input name="lessonId" type="hidden" value={lessonId} />
      ) : null}

      {state.error ? (
        <div className="errorNotice" role="alert">
          {state.error}
        </div>
      ) : null}

      <section className="exercisePicker">
        <div>
          <p className="sectionLabel">운동 선택</p>
          <h2>부위와 운동을 선택하세요</h2>
        </div>

        <div className="categoryTabs" role="tablist" aria-label="운동 부위">
          {exerciseCategories.map((category) => (
            <button
              aria-selected={category.id === activeCategory?.id}
              className={
                category.id === activeCategory?.id
                  ? "categoryTab active"
                  : "categoryTab"
              }
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              role="tab"
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        {activeCategory ? (
          <div className="exerciseChoices">
            {activeCategory.exercises.map((exercise) => {
              const key = `catalog:${exercise.id}`;
              const isSelected = selectedExercises.some((item) => {
                return getSelectedKey(item) === key;
              });

              return (
                <button
                  className={
                    isSelected ? "exerciseChoice selected" : "exerciseChoice"
                  }
                  key={exercise.id}
                  onClick={() => toggleCatalogExercise(activeCategory, exercise)}
                  type="button"
                >
                  {exercise.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="customExerciseBox">
          <label>
            선택지에 없는 운동
            <input
              onChange={(event) => setCustomExerciseName(event.target.value)}
              placeholder="예: 머신 로우"
              value={customExerciseName}
            />
          </label>
          <button
            className="secondaryButton"
            onClick={addCustomExercise}
            type="button"
          >
            현재 부위에 추가
          </button>
        </div>
      </section>

      <section className="selectedExerciseSection">
        <div>
          <p className="sectionLabel">선택한 운동</p>
          <h2>{selectedExercises.length}개</h2>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="lessonEmpty">
            <h3>아직 선택한 운동이 없습니다.</h3>
            <p>위에서 부위를 고른 뒤 운동을 눌러 추가하세요.</p>
          </div>
        ) : (
          <div className="selectedExerciseRows">
            {selectedExercises.map((exercise, index) => {
              const key = getSelectedKey(exercise);

              return (
                <article
                  className={
                    draggingKey === key
                      ? "selectedExerciseRow dragging"
                      : "selectedExerciseRow"
                  }
                  key={key}
                >
                  <input
                    name="exerciseCatalogId"
                    type="hidden"
                    value={exercise.exerciseCatalogId}
                  />
                  <input
                    name="customCategoryId"
                    type="hidden"
                    value={exercise.exerciseCatalogId ? "" : exercise.categoryId}
                  />
                  <input
                    name="customName"
                    type="hidden"
                    value={exercise.customName}
                  />

                  <button
                    aria-label={`${exercise.name} 순서 변경`}
                    className="dragHandle"
                    onPointerCancel={stopDragging}
                    onPointerDown={(event) => startDragging(event, key)}
                    onPointerMove={(event) => dragExercise(event, key)}
                    onPointerUp={stopDragging}
                    type="button"
                  >
                    ☰
                  </button>

                  <div className="selectedExerciseTitle">
                    <strong>{exercise.name}</strong>
                    <span>{exercise.categoryName}</span>
                  </div>

                  <label>
                    세트
                    <input
                      min="0"
                      name="sets"
                      onChange={(event) =>
                        updateSelectedExercise(key, "sets", event.target.value)
                      }
                      placeholder="예: 3"
                      type="number"
                      value={exercise.sets}
                    />
                  </label>

                  <label>
                    reps
                    <input
                      min="0"
                      name="reps"
                      onChange={(event) =>
                        updateSelectedExercise(key, "reps", event.target.value)
                      }
                      placeholder="예: 10"
                      type="number"
                      value={exercise.reps}
                    />
                  </label>

                  <label>
                    중량 kg
                    <input
                      min="0"
                      name="weightKg"
                      onChange={(event) =>
                        updateSelectedExercise(
                          key,
                          "weightKg",
                          event.target.value
                        )
                      }
                      placeholder="선택"
                      step="0.5"
                      type="number"
                      value={exercise.weightKg}
                    />
                  </label>

                  <label className="selectedExerciseMemo">
                    메모
                    <input
                      name="exerciseMemo"
                      onChange={(event) =>
                        updateSelectedExercise(key, "memo", event.target.value)
                      }
                      placeholder="선택"
                      value={exercise.memo}
                    />
                  </label>

                  <input name="sortOrder" type="hidden" value={index} />

                  <button
                    className="dangerButton"
                    onClick={() => removeSelectedExercise(key)}
                    type="button"
                  >
                    제거
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <label>
        전체 메모
        <textarea
          defaultValue={initialNotes}
          name="notes"
          placeholder="컨디션, 다음 수업에서 확인할 점, 주의사항 등을 적습니다."
          rows="4"
        />
      </label>

      <SignaturePad initialSignatureData={initialSignatureData} />

      <div className="formActions">
        <button
          className="primaryButton"
          disabled={isPending || selectedExercises.length === 0}
          type="submit"
        >
          {isPending
            ? mode === "edit"
              ? "수정 중..."
              : "저장 중..."
            : mode === "edit"
              ? "레슨 수정 저장"
              : "레슨 저장"}
        </button>
      </div>
    </form>
  );
}
