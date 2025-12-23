import React, { useEffect, useRef, useState } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type Cell = {
  x: number;
  y: number;
};

const GRID_SIZE = 20; // 20x20 网格
const INITIAL_SNAKE: Cell[] = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];

const getRandomFood = (snake: Cell[]): Cell => {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const onSnake = snake.some((s) => s.x === food.x && s.y === food.y);
    if (!onSnake) return food;
  }
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Cell>(() => getRandomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150); // ms
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const directionRef = useRef<Direction>("RIGHT");

  directionRef.current = direction;

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (!isRunning && !isGameOver && e.key === " ") {
        // 空格开始游戏
        setIsRunning(true);
        return;
      }

      setIsRunning(true);

      setDirection((prev) => {
        switch (e.key) {
          case "ArrowUp":
            return prev === "DOWN" ? prev : "UP";
          case "ArrowDown":
            return prev === "UP" ? prev : "DOWN";
          case "ArrowLeft":
            return prev === "RIGHT" ? prev : "LEFT";
          case "ArrowRight":
            return prev === "LEFT" ? prev : "RIGHT";
          default:
            return prev;
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isGameOver]);

  // 游戏主循环
  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: Cell = { ...head };

        switch (directionRef.current) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y };
            break;
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // 撞墙
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }

        // 撞到自己
        if (prevSnake.some((cell) => cell.x === newHead.x && cell.y === newHead.y)) {
          setIsGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // 吃到食物
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          setFood(getRandomFood(newSnake));
          setSpeed((sp) => Math.max(60, sp - 5)); // 逐渐加速
          return newSnake; // 不去掉尾巴，身体变长
        }

        // 正常移动：去掉最后一节
        newSnake.pop();
        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [food, isRunning, isGameOver, speed]);

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection("RIGHT");
    setFood(getRandomFood(INITIAL_SNAKE));
    setScore(0);
    setSpeed(150);
    setIsGameOver(false);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 md:p-6 w-[360px] md:w-[420px] flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">贪吃蛇</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              方向键移动，空格开始
            </span>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            重开
          </button>
        </div>

        <div className="flex items-center justify-between text-sm mb-1">
          <span>
            分数：<span className="font-semibold">{score}</span>
          </span>
          {isGameOver ? (
            <span className="text-red-500 font-medium">游戏结束</span>
          ) : isRunning ? (
            <span className="text-green-500 font-medium">进行中</span>
          ) : (
            <span className="text-gray-400">按空格开始</span>
          )}
        </div>

        <div
          className="relative mx-auto bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
          style={{
            width: 320,
            height: 320,
          }}
        >
          {/* 网格背景 */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => (
              <div
                key={idx}
                className="border border-gray-800/40"
                style={{ boxSizing: "border-box" }}
              />
            ))}
          </div>

          {/* 食物 */}
          <div
            className="absolute rounded-sm bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.9)]"
            style={{
              width: 16,
              height: 16,
              left: food.x * 16 + 2,
              top: food.y * 16 + 2,
            }}
          />

          {/* 蛇身体 */}
          {snake.map((cell, idx) => (
            <div
              key={`${cell.x}-${cell.y}-${idx}`}
              className={`absolute rounded-[3px] ${
                idx === 0
                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                  : "bg-emerald-500"
              }`}
              style={{
                width: 16,
                height: 16,
                left: cell.x * 16 + 2,
                top: cell.y * 16 + 2,
              }}
            />
          ))}
        </div>

        {isGameOver && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p>撞墙或咬到自己啦，再试一次？</p>
          </div>
        )}

        <p className="text-[11px] text-gray-400 text-center">
          小彩蛋：累了可以玩一会儿，再继续学习 😄
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;




