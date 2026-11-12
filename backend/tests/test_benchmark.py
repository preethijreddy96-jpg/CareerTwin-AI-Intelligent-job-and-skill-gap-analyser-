from app.ml.benchmark import run_skill_extraction_benchmark

def test_benchmark_metrics(db_session):
    benchmark_results = run_skill_extraction_benchmark(db_session)
    precision = benchmark_results["overall_precision"]
    recall = benchmark_results["overall_recall"]
    f1 = benchmark_results["overall_f1_score"]

    print(f"\n================ BENCHMARK RESULTS ================")
    print(f"Total Ground Truth Skills : {benchmark_results['total_ground_truth_skills']}")
    print(f"Total Extracted Skills    : {benchmark_results['total_extracted_skills']}")
    print(f"Precision                 : {precision:.4f} ({precision*100:.1f}%)")
    print(f"Recall                    : {recall:.4f} ({recall*100:.1f}%)")
    print(f"F1-Score                  : {f1:.4f} ({f1*100:.1f}%)")
    print(f"===================================================\n")

    # High performance validation (> 85% precision and recall on canonical benchmark)
    assert precision >= 0.85
    assert recall >= 0.85
    assert f1 >= 0.85

