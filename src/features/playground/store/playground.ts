import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type PlaygroundState = {};

const usePlaygroundStore = create<PlaygroundState>()(immer(set => ({})));
