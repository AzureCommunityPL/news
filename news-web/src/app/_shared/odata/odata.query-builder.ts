import { ODataQuery, ODataFilter, ODataFilterMap } from './odata.models';

export class ODataQueryBuilder {
    public static build(query: ODataQuery): string {
        const segments: string[] = [];

        if (query.select) {
            segments.push(`$select=${query.select.join(',')}`);
        }

        if (query.filters) {
            segments.push(this.buildFilterQuery(query.filters));
        }

        if (query.top) {
            segments.push(`$top=${query.top}`);
        }

        return segments.join('&');
    }

    private static buildFilterQuery(filters: ODataFilter[]) {
        return `$filter=${this.getFilterQuery(filters)}`;
    }

    private static getFilterQuery(filters: ODataFilter[]): string {
        const filterExpressions = filters.map(f => this.getFilterExpression(f)).join(' ');
        return encodeURIComponent(`${filterExpressions}`);
    }

    private static getFilterExpression(filter: ODataFilter): string {
        return filter.operator
            ? `${ODataFilterMap[filter.operator]} ${filter.key} ${ODataFilterMap[filter.expression]} '${filter.value}'`
            : `${filter.key} ${ODataFilterMap.get(filter.expression)} '${filter.value}'`;
    }
}
