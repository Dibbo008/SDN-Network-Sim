# SDN-Network-Sim: Enterprise Software-Defined Network Simulator

An advanced, thesis-level web-based Software-Defined Networking (SDN) simulator and algorithmic infrastructure optimizer. Built with **React**, **React Flow**, and a high-performance graph algorithm engine, this tool simulates enterprise data center topologies, calculates optimal routing paths, minimizes fiber deployment costs, and provides real-time telemetry analytics.

---

## Features & Core Modules

* **Interactive Network Canvas (`React Flow`):** 
  * Enterprise-grade dark-themed UI mimicking modern SDN controllers (e.g., Cisco DNA Center / Cloudflare dashboards).
  * Dynamic rendering of Spine-Leaf fabric architectures, Core Routers, Switches, and Top-of-Rack (ToR) servers.
* **Graph Algorithm Engine (`src/engine/`):**
  * **Shortest Path & Routing:** Dijkstra, Bellman-Ford, Floyd-Warshall, and Johnson’s Algorithm.
  * **Minimum Spanning Tree (MST):** Kruskal's and Prim's Algorithm for optimal fiber optic cable cost reduction.
* **Network Stress & Failure Simulation:**
  * Interactive link/node disabling (`Simulate Link Failure`) that triggers instant dynamic re-routing and alternative path calculation.
* **Thesis Analytics & Telemetry Dashboard:**
  * Sub-millisecond execution time benchmarking (`performance.now()`).
  * Real-time network telemetry, node CPU utilization tracking, and total infrastructure cost estimation ($).

---

## Tech Stack

* **Frontend Framework:** React.js (Vite)
* **Styling:** Tailwind CSS & Lucide Icons
* **Graph Canvas & Interaction:** `@xyflow/react` (React Flow)
* **Data Visualization & Metrics:** Recharts
* **State Management:** Zustand

---

## Getting Started Locally

Follow these steps to run the project on your local machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/Dibbo008/SDN-Network-Sim.git](https://github.com/Dibbo008/SDN-Network-Sim.git)
cd SDN-Network-Sim
