<script lang="ts">
	type DeliveryPlanRow = {
		supplier: string;
		fish: string;
		lbs: number;
		eta: string;
		status: string;
	};

	let { rows } = $props<{ rows: DeliveryPlanRow[] }>();
</script>

<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
	<table class="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
		<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
			<tr>
				<th class="px-4 py-3">Supplier</th>
				<th class="px-4 py-3">Fish</th>
				<th class="px-4 py-3">Lbs</th>
				<th class="px-4 py-3">ETA</th>
				<th class="px-4 py-3">Status</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 bg-white">
			{#each rows as row}
				<tr>
					<td class="px-4 py-3 font-medium text-slate-900">{row.supplier}</td>
					<td class="px-4 py-3">{row.fish}</td>
					<td class="px-4 py-3">{row.lbs.toLocaleString()}</td>
					<td class="px-4 py-3">{row.eta}</td>
					<td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.status}</span></td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
